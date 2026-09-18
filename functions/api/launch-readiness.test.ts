import { describe, expect, it, vi } from "vitest";
import { handleLaunchReadiness } from "./launch-readiness";

const env = {
  SITE_HEALTH_API_KEY: "health-secret",
  OPENAI_API_KEY: "openai-secret",
  SUPABASE_URL: "https://mkgnyarwiscttobnytin.supabase.co",
  SUPABASE_SERVICE_ROLE_KEY: "service-role",
  STRIPE_SECRET_KEY: "stripe-secret",
  HUBSPOT_ACCESS_TOKEN: "hubspot-secret",
};

function request(secret = "health-secret") {
  return new Request("https://otdaisurfer.surf/api/launch-readiness", {
    method: "POST",
    headers: { Authorization: `Bearer ${secret}` },
  });
}

function readyFetch() {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes("supabase.co/rest/v1/wave_starter_intakes")) {
      return new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (url.includes("api.stripe.com/v1/payment_links/")) {
      return new Response(JSON.stringify({
        active: true,
        livemode: true,
        metadata: { offer_slug: "wave-starter" },
        after_completion: {
          type: "redirect",
          redirect: {
            url: "https://otdaisurfer.surf/wave-starter/success?session_id={CHECKOUT_SESSION_ID}",
          },
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unexpected URL: ${url}`);
  });
}

describe("production launch readiness", () => {
  it("returns ready when the production bindings and downstream checks pass", async () => {
    const response = await handleLaunchReadiness(request(), env, readyFetch());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      status: "ready",
      blockers: [],
      checks: {
        openai: { ok: true },
        hubspot: { ok: true },
        supabase: { ok: true },
        stripe: { ok: true },
      },
    });
  });

  it("blocks launch when a required binding is missing", async () => {
    const response = await handleLaunchReadiness(
      request(),
      { ...env, HUBSPOT_ACCESS_TOKEN: undefined },
      readyFetch(),
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "blocked",
      blockers: ["hubspot"],
      checks: {
        hubspot: { ok: false },
      },
    });
  });

  it("blocks launch when the Supabase URL points at the wrong project", async () => {
    const response = await handleLaunchReadiness(
      request(),
      { ...env, SUPABASE_URL: "https://wrong.supabase.co" },
      readyFetch(),
    );

    const body = await response.json() as { blockers: string[] };
    expect(body.blockers).toContain("supabase");
  });

  it("rejects unauthorized checks", async () => {
    const fetchImpl = vi.fn();
    const response = await handleLaunchReadiness(request("wrong"), env, fetchImpl);

    expect(response.status).toBe(401);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
