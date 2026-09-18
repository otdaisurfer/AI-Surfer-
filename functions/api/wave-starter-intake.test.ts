import { describe, expect, it, vi } from "vitest";
import { handleWaveStarterIntake } from "./wave-starter-intake";

const env = {
  STRIPE_SECRET_KEY: "sk_live_test_only",
  SUPABASE_URL: "https://example.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
};

function makeRequest(overrides: Record<string, unknown> = {}) {
  return new Request("https://otdaisurfer.surf/api/wave-starter-intake", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: "cs_live_paid123",
      contactName: "Taylor Reed",
      email: "taylor@example.com",
      businessName: "Harbor & Pine",
      website: "https://example.com",
      primaryGoal: "Stop losing qualified leads after hours.",
      biggestBottleneck: "Manual follow-up is inconsistent.",
      systemsUsed: ["Website", "Gmail", "HubSpot"],
      notes: "We want to start with lead follow-up.",
      ...overrides,
    }),
  });
}

function mockFetch() {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);

    if (url.includes("api.stripe.com/v1/checkout/sessions/")) {
      return new Response(JSON.stringify({
        id: "cs_live_paid123",
        object: "checkout.session",
        amount_total: 49700,
        currency: "usd",
        payment_status: "paid",
        status: "complete",
        customer_details: { email: "taylor@example.com" },
        metadata: { offer_slug: "wave-starter" },
      }), { status: 200, headers: { "Content-Type": "application/json" } });
    }

    if (url.includes("/rest/v1/wave_starter_intakes")) {
      expect(init?.method).toBe("POST");
      expect(JSON.parse(String(init?.body))).toMatchObject({
        contact_name: "Taylor Reed",
        business_name: "Harbor & Pine",
        email: "taylor@example.com",
        status: "new",
      });
      return new Response(JSON.stringify([{ id: "intake-1" }]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("/rest/v1/ai_fin_onboarding")) {
      expect(JSON.parse(String(init?.body))).toMatchObject({
        recommended_product: "Wave Starter",
        recommended_package: "Wave Starter",
        next_step_type: "intake_form",
        status: "routed",
        checkout_status: "ready",
      });
      return new Response(JSON.stringify([{ id: "onboarding-1" }]), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  });
}

describe("Wave Starter paid onboarding intake", () => {
  it("verifies payment and stores both kickoff intake and onboarding handoff", async () => {
    const fetchImpl = mockFetch();
    const response = await handleWaveStarterIntake(makeRequest(), env, fetchImpl);

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "received",
      nextStep: "team_handoff",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(3);
  });

  it("requires the checkout email when Stripe provides one", async () => {
    const fetchImpl = mockFetch();
    const response = await handleWaveStarterIntake(
      makeRequest({ email: "different@example.com" }),
      env,
      fetchImpl,
    );

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Use the same email address that was used for the Wave Starter payment.",
    });
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });

  it("rejects incomplete intake data before touching Stripe", async () => {
    const fetchImpl = vi.fn();
    const response = await handleWaveStarterIntake(
      makeRequest({ primaryGoal: "" }),
      env,
      fetchImpl,
    );

    expect(response.status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("rejects an unpaid or wrong checkout", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      if (String(input).includes("api.stripe.com")) {
        return new Response(JSON.stringify({
          id: "cs_live_paid123",
          object: "checkout.session",
          amount_total: 49700,
          currency: "usd",
          payment_status: "unpaid",
          status: "open",
          customer_details: { email: "taylor@example.com" },
          metadata: { offer_slug: "wave-starter" },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }
      throw new Error("Supabase should not be called");
    });

    const response = await handleWaveStarterIntake(makeRequest(), env, fetchImpl);
    expect(response.status).toBe(409);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
