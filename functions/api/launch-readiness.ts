const WAVE_STARTER_PAYMENT_LINK_ID = "plink_1UFGD3Ex9w41hLcklxOvUg4f";
const HUBSPOT_WAVE_STARTER_PRODUCT_ID = "332891806434";
const EXPECTED_SUPABASE_URL = "https://mkgnyarwiscttobnytin.supabase.co";

interface LaunchReadinessEnv {
  SITE_HEALTH_API_KEY?: string;
  OPENAI_API_KEY?: string;
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  STRIPE_SECRET_KEY?: string;
  HUBSPOT_ACCESS_TOKEN?: string;
}

interface LaunchReadinessContext {
  request: Request;
  env: LaunchReadinessEnv;
}

type CheckResult = {
  ok: boolean;
  detail: string;
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

function authorized(request: Request, secret?: string) {
  if (!secret) return false;
  return request.headers.get("Authorization") === `Bearer ${secret}`;
}

async function probeSupabase(env: LaunchReadinessEnv, fetchImpl: typeof fetch): Promise<CheckResult> {
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    return { ok: false, detail: "Supabase server bindings are missing." };
  }

  if (env.SUPABASE_URL.replace(/\/$/, "") !== EXPECTED_SUPABASE_URL) {
    return { ok: false, detail: "Supabase URL does not match the connected AI-Surfer project." };
  }

  try {
    const response = await fetchImpl(
      `${EXPECTED_SUPABASE_URL}/rest/v1/wave_starter_intakes?select=id&limit=1`,
      {
        headers: {
          apikey: env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
      },
    );

    if (!response.ok) {
      return { ok: false, detail: "Supabase could not read the Wave Starter intake table." };
    }

    return { ok: true, detail: "Supabase intake storage is reachable." };
  } catch {
    return { ok: false, detail: "Supabase could not be reached." };
  }
}

async function probeHubSpot(env: LaunchReadinessEnv, fetchImpl: typeof fetch): Promise<CheckResult> {
  if (!env.HUBSPOT_ACCESS_TOKEN) {
    return { ok: false, detail: "HubSpot server binding is missing." };
  }

  try {
    const response = await fetchImpl(
      `https://api.hubapi.com/crm/v3/objects/products/${HUBSPOT_WAVE_STARTER_PRODUCT_ID}?properties=name,hs_sku,price,hs_status`,
      {
        headers: {
          Authorization: `Bearer ${env.HUBSPOT_ACCESS_TOKEN}`,
        },
      },
    );

    const body = await response.json().catch(() => ({})) as {
      properties?: {
        name?: string;
        hs_sku?: string;
        price?: string;
        hs_status?: string;
      };
    };

    const product = body.properties;
    const correct =
      response.ok &&
      product?.hs_sku === "wave-starter" &&
      product?.price === "497" &&
      product?.hs_status === "active";

    return correct
      ? { ok: true, detail: "HubSpot Wave Starter product is active at $497." }
      : { ok: false, detail: "HubSpot Wave Starter product does not match the expected launch configuration." };
  } catch {
    return { ok: false, detail: "HubSpot could not be reached." };
  }
}

async function probeStripe(env: LaunchReadinessEnv, fetchImpl: typeof fetch): Promise<CheckResult> {
  if (!env.STRIPE_SECRET_KEY) {
    return { ok: false, detail: "Stripe secret binding is missing." };
  }

  try {
    const response = await fetchImpl(
      `https://api.stripe.com/v1/payment_links/${WAVE_STARTER_PAYMENT_LINK_ID}`,
      {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        },
      },
    );

    const body = await response.json().catch(() => ({})) as {
      active?: boolean;
      livemode?: boolean;
      metadata?: Record<string, string>;
      after_completion?: {
        type?: string;
        redirect?: { url?: string };
      };
    };

    const redirect = body.after_completion?.redirect?.url ?? "";
    const correct =
      response.ok &&
      body.active === true &&
      body.livemode === true &&
      body.metadata?.offer_slug === "wave-starter" &&
      redirect.includes("/wave-starter/success") &&
      redirect.includes("{CHECKOUT_SESSION_ID}");

    return correct
      ? { ok: true, detail: "Live Wave Starter Stripe link is active and returns to the verified success flow." }
      : { ok: false, detail: "Wave Starter Stripe link does not match the expected launch configuration." };
  } catch {
    return { ok: false, detail: "Stripe could not be reached." };
  }
}

export async function handleLaunchReadiness(
  request: Request,
  env: LaunchReadinessEnv,
  fetchImpl: typeof fetch = fetch,
) {
  if (request.method !== "POST") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  if (!authorized(request, env.SITE_HEALTH_API_KEY)) {
    return json({ ok: false, error: "Unauthorized launch-readiness check." }, 401);
  }

  const bindingChecks: Record<string, CheckResult> = {
    openai: env.OPENAI_API_KEY
      ? { ok: true, detail: "OpenAI server binding is present." }
      : { ok: false, detail: "OpenAI server binding is missing." },
  };

  const [hubspot, supabase, stripe] = await Promise.all([
    probeHubSpot(env, fetchImpl),
    probeSupabase(env, fetchImpl),
    probeStripe(env, fetchImpl),
  ]);

  const checks = {
    ...bindingChecks,
    hubspot,
    supabase,
    stripe,
  };

  const failed = Object.entries(checks)
    .filter(([, result]) => !result.ok)
    .map(([name]) => name);

  return json({
    ok: true,
    status: failed.length === 0 ? "ready" : "blocked",
    checkedAt: new Date().toISOString(),
    checks,
    blockers: failed,
  });
}

export const onRequestPost = (context: LaunchReadinessContext) =>
  handleLaunchReadiness(context.request, context.env);
