interface WaveStarterIntakeEnv {
  STRIPE_SECRET_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

interface StripeCheckoutSession {
  id?: string;
  object?: string;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  status?: string | null;
  customer_details?: {
    email?: string | null;
    name?: string | null;
  } | null;
  customer_email?: string | null;
  metadata?: Record<string, string> | null;
}

type IntakePayload = {
  sessionId?: string;
  contactName?: string;
  email?: string;
  businessName?: string;
  website?: string;
  primaryGoal?: string;
  biggestBottleneck?: string;
  systemsUsed?: string[];
  notes?: string;
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "no-referrer",
    },
  });
}

function validSessionId(value: string | undefined) {
  return Boolean(value && /^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(value));
}

function cleanText(value: string | undefined, max: number) {
  return (value ?? "").trim().slice(0, max);
}

function cleanUrl(value: string | undefined) {
  const trimmed = cleanText(value, 500);
  if (!trimmed) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

async function fetchStripeSession(sessionId: string, secret: string, fetchImpl: typeof fetch) {
  const response = await fetchImpl(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );

  let body: StripeCheckoutSession = {};
  try {
    body = await response.json() as StripeCheckoutSession;
  } catch {
    // Keep failures generic.
  }

  if (!response.ok || body.object !== "checkout.session") {
    throw new Error("INVALID_CHECKOUT_SESSION");
  }

  return body;
}

function verifyWaveStarter(session: StripeCheckoutSession) {
  return (
    session.metadata?.offer_slug === "wave-starter" &&
    session.amount_total === 49_700 &&
    session.currency?.toLowerCase() === "usd" &&
    session.payment_status === "paid" &&
    session.status === "complete"
  );
}

async function deterministicUuid(value: string, namespace: string) {
  const bytes = new TextEncoder().encode(`${namespace}:${value}`);
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  digest[6] = (digest[6] & 0x0f) | 0x50;
  digest[8] = (digest[8] & 0x3f) | 0x80;
  const hex = Array.from(digest.slice(0, 16), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

async function supabaseInsert(
  env: WaveStarterIntakeEnv,
  table: string,
  payload: Record<string, unknown>,
  fetchImpl: typeof fetch,
) {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_NOT_CONFIGURED");
  }

  const response = await fetchImpl(
    `${env.SUPABASE_URL.replace(/\/$/, "")}/rest/v1/${table}`,
    {
      method: "POST",
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=representation,resolution=merge-duplicates",
      },
      body: JSON.stringify(payload),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`SUPABASE_INSERT_FAILED:${response.status}:${detail.slice(0, 120)}`);
  }

  const rows = await response.json().catch(() => []);
  return Array.isArray(rows) ? rows[0] : null;
}

export async function handleWaveStarterIntake(
  request: Request,
  env: WaveStarterIntakeEnv,
  fetchImpl: typeof fetch = fetch,
) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return json({ ok: false, error: "Stripe verification is not configured." }, 503);
  }

  let input: IntakePayload;
  try {
    input = await request.json() as IntakePayload;
  } catch {
    return json({ ok: false, error: "Invalid intake payload." }, 400);
  }

  if (!validSessionId(input.sessionId)) {
    return json({ ok: false, error: "A valid checkout session is required." }, 400);
  }

  const contactName = cleanText(input.contactName, 120);
  const email = cleanText(input.email, 254).toLowerCase();
  const businessName = cleanText(input.businessName, 160);
  const primaryGoal = cleanText(input.primaryGoal, 1500);
  const biggestBottleneck = cleanText(input.biggestBottleneck, 1500);
  const notes = cleanText(input.notes, 3000) || null;
  const website = cleanUrl(input.website);
  const systemsUsed = Array.from(
    new Set((input.systemsUsed ?? []).map((item) => cleanText(item, 120)).filter(Boolean)),
  ).slice(0, 20);

  if (!contactName || !email || !businessName || !primaryGoal || !biggestBottleneck) {
    return json({
      ok: false,
      error: "Name, email, business name, primary goal, and biggest bottleneck are required.",
    }, 400);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ ok: false, error: "Enter a valid email address." }, 400);
  }

  let session: StripeCheckoutSession;
  try {
    session = await fetchStripeSession(input.sessionId!, env.STRIPE_SECRET_KEY, fetchImpl);
  } catch {
    return json({ ok: false, error: "Checkout session could not be verified." }, 404);
  }

  if (!verifyWaveStarter(session)) {
    return json({ ok: false, error: "This checkout is not a verified Wave Starter payment." }, 409);
  }

  const stripeEmail = (session.customer_details?.email ?? session.customer_email ?? "")
    .trim()
    .toLowerCase();

  if (stripeEmail && stripeEmail !== email) {
    return json({
      ok: false,
      error: "Use the same email address that was used for the Wave Starter payment.",
    }, 409);
  }

  const verifiedSessionId = session.id ?? input.sessionId!;
  const intakeId = await deterministicUuid(verifiedSessionId, "wave-starter-intake");
  const onboardingId = await deterministicUuid(verifiedSessionId, "wave-starter-onboarding");

  try {
    await supabaseInsert(env, "wave_starter_intakes", {
      id: intakeId,
      stripe_checkout_session_id: verifiedSessionId,
      contact_name: contactName,
      email,
      business_name: businessName,
      website,
      primary_goal: primaryGoal,
      biggest_bottleneck: biggestBottleneck,
      systems_used: systemsUsed,
      notes,
      status: "new",
    }, fetchImpl);

    await supabaseInsert(env, "ai_fin_onboarding", {
      id: onboardingId,
      lead_id: null,
      contact_name: contactName,
      business_name: businessName,
      email,
      recommended_product: "Wave Starter",
      recommended_package: "Wave Starter",
      next_step_type: "intake_form",
      status: "routed",
      checkout_status: "ready",
    }, fetchImpl);
  } catch {
    return json({
      ok: false,
      error: "Your payment is verified, but we could not save the kickoff intake yet. Please try again.",
    }, 503);
  }

  return json({
    ok: true,
    status: "received",
    intakeId,
    onboardingId,
    nextStep: "team_handoff",
  }, 201);
}

export const onRequestPost: PagesFunction<WaveStarterIntakeEnv> = async (context) =>
  handleWaveStarterIntake(context.request, context.env);
