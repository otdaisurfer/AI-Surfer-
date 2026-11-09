interface WaveStarterSessionEnv {
  STRIPE_SECRET_KEY?: string;
}

interface StripeCheckoutSession {
  id?: string;
  object?: string;
  amount_total?: number | null;
  currency?: string | null;
  payment_status?: string | null;
  status?: string | null;
  metadata?: Record<string, string> | null;
}

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

function validSessionId(value: string | null) {
  return Boolean(value && /^cs_(test_|live_)?[A-Za-z0-9_]+$/.test(value));
}

export async function handleWaveStarterSession(
  request: Request,
  env: WaveStarterSessionEnv,
  fetchStripe: typeof fetch = fetch,
) {
  if (request.method !== "GET") {
    return json({ ok: false, error: "Method not allowed." }, 405);
  }

  if (!env.STRIPE_SECRET_KEY) {
    return json({ ok: false, error: "Stripe verification is not configured." }, 503);
  }

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!validSessionId(sessionId)) {
    return json({ ok: false, error: "A valid checkout session is required." }, 400);
  }

  let stripeResponse: Response;
  try {
    stripeResponse = await fetchStripe(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId!)}`,
      {
        headers: {
          Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        },
      },
    );
  } catch {
    return json({ ok: false, error: "Stripe could not be reached." }, 502);
  }

  let session: StripeCheckoutSession = {};
  try {
    session = (await stripeResponse.json()) as StripeCheckoutSession;
  } catch {
    // Keep the response intentionally generic.
  }

  if (!stripeResponse.ok || session.object !== "checkout.session") {
    return json({ ok: false, error: "Checkout session could not be verified." }, 404);
  }

  const correctOffer = session.metadata?.offer_slug === "wave-starter";
  const correctAmount = session.amount_total === 49_700;
  const correctCurrency = session.currency?.toLowerCase() === "usd";
  const paid = session.payment_status === "paid";
  const complete = session.status === "complete";

  if (!correctOffer || !correctAmount || !correctCurrency) {
    return json({ ok: false, error: "This checkout session is not a Wave Starter purchase." }, 409);
  }

  if (!paid || !complete) {
    return json({
      ok: true,
      verified: false,
      status: session.status ?? "unknown",
      paymentStatus: session.payment_status ?? "unknown",
    });
  }

  return json({
    ok: true,
    verified: true,
    offer: "Wave Starter",
    amount: 497,
    currency: "USD",
    sessionId: session.id ?? sessionId,
  });
}

export const onRequestGet: PagesFunction<WaveStarterSessionEnv> = async (context) =>
  handleWaveStarterSession(context.request, context.env);
