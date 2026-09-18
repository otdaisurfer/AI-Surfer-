import { describe, expect, it, vi } from "vitest";
import { handleWaveStarterSession } from "./wave-starter-session";

const env = { STRIPE_SECRET_KEY: "sk_live_test_only" };

function request(sessionId = "cs_live_abc123") {
  return new Request(
    `https://otdaisurfer.surf/api/wave-starter-session?session_id=${sessionId}`,
  );
}

describe("Wave Starter checkout verification", () => {
  it("confirms a paid $497 Wave Starter checkout", async () => {
    const fetchStripe = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toContain("/v1/checkout/sessions/cs_live_abc123");
      expect(init?.headers).toEqual({ Authorization: "Bearer sk_live_test_only" });

      return new Response(JSON.stringify({
        id: "cs_live_abc123",
        object: "checkout.session",
        amount_total: 49700,
        currency: "usd",
        payment_status: "paid",
        status: "complete",
        metadata: { offer_slug: "wave-starter" },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    });

    const response = await handleWaveStarterSession(request(), env, fetchStripe);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      ok: true,
      verified: true,
      offer: "Wave Starter",
      amount: 497,
      currency: "USD",
      sessionId: "cs_live_abc123",
    });
  });

  it("does not mark an unpaid checkout as verified", async () => {
    const fetchStripe = vi.fn(async () =>
      new Response(JSON.stringify({
        id: "cs_live_abc123",
        object: "checkout.session",
        amount_total: 49700,
        currency: "usd",
        payment_status: "unpaid",
        status: "open",
        metadata: { offer_slug: "wave-starter" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    const response = await handleWaveStarterSession(request(), env, fetchStripe);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      verified: false,
      status: "open",
      paymentStatus: "unpaid",
    });
  });

  it("rejects sessions for the wrong offer or amount", async () => {
    const fetchStripe = vi.fn(async () =>
      new Response(JSON.stringify({
        id: "cs_live_abc123",
        object: "checkout.session",
        amount_total: 9700,
        currency: "usd",
        payment_status: "paid",
        status: "complete",
        metadata: { offer_slug: "aeo-wave-audit" },
      }), { status: 200, headers: { "Content-Type": "application/json" } }),
    );

    const response = await handleWaveStarterSession(request(), env, fetchStripe);
    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "This checkout session is not a Wave Starter purchase.",
    });
  });

  it("rejects malformed checkout session IDs before calling Stripe", async () => {
    const fetchStripe = vi.fn();
    const response = await handleWaveStarterSession(request("../secret"), env, fetchStripe);

    expect(response.status).toBe(400);
    expect(fetchStripe).not.toHaveBeenCalled();
  });

  it("fails safely when Stripe verification is not configured", async () => {
    const response = await handleWaveStarterSession(request(), {}, vi.fn());

    expect(response.status).toBe(503);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Stripe verification is not configured.",
    });
  });
});
