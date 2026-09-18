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
    const url = new URL(String(input));

    if (
      url.hostname === "mkgnyarwiscttobnytin.supabase.co" &&
      url.pathname === "/auth/v1/user"
    ) {
      return new Response(JSON.stringify({ id: "owner-user-id" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.hostname === "mkgnyarwiscttobnytin.supabase.co" &&
      url.pathname === "/rest/v1/profiles"
    ) {
      return new Response(JSON.stringify([{ role: "owner" }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.hostname === "api.hubapi.com" &&
      url.pathname.startsWith("/crm/v3/objects/products/")
    ) {
      return new Response(JSON.stringify({
        id: "332891806434",
        properties: {
          name: "🌊 Wave Starter",
          hs_sku: "wave-starter",
          price: "497",
          hs_status: "active",
        },
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.hostname === "mkgnyarwiscttobnytin.supabase.co" &&
      url.pathname === "/rest/v1/wave_starter_intakes"
    ) {
      return new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (
      url.hostname === "api.stripe.com" &&
      url.pathname.startsWith("/v1/payment_links/")
    ) {
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

    throw new Error(`Unexpected URL: ${url.toString()}`);
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


  it("allows a verified owner Supabase session to run the readiness check", async () => {
    const ownerRequest = new Request("https://otdaisurfer.surf/api/launch-readiness", {
      method: "POST",
      headers: { Authorization: "Bearer owner-session-token" },
    });

    const response = await handleLaunchReadiness(ownerRequest, env, readyFetch());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: "ready",
      blockers: [],
    });
  });

  it("rejects a valid signed-in user who is not an owner", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.endsWith("/auth/v1/user")) {
        return new Response(JSON.stringify({ id: "member-user-id" }), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      if (url.includes("/rest/v1/profiles?")) {
        return new Response(JSON.stringify([{ role: "member" }]), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      }

      throw new Error(`Unexpected URL: ${url}`);
    });

    const memberRequest = new Request("https://otdaisurfer.surf/api/launch-readiness", {
      method: "POST",
      headers: { Authorization: "Bearer member-session-token" },
    });

    const response = await handleLaunchReadiness(memberRequest, env, fetchImpl);
    expect(response.status).toBe(401);
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

  it("blocks launch when the live HubSpot Wave Starter product drifts", async () => {
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (url.hostname === "api.hubapi.com") {
        return new Response(JSON.stringify({
          properties: {
            name: "🌊 Wave Starter",
            hs_sku: "wave-starter",
            price: "399",
            hs_status: "active",
          },
        }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      return readyFetch()(input);
    });

    const response = await handleLaunchReadiness(request(), env, fetchImpl);
    const body = await response.json() as { blockers: string[] };

    expect(body.blockers).toContain("hubspot");
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
    const fetchImpl = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(String(input));

      if (
        url.hostname === "mkgnyarwiscttobnytin.supabase.co" &&
        url.pathname === "/auth/v1/user"
      ) {
        return new Response(JSON.stringify({ error: "invalid token" }), { status: 401 });
      }

      throw new Error(`Unexpected URL: ${url.toString()}`);
    });

    const response = await handleLaunchReadiness(request("wrong"), env, fetchImpl);

    expect(response.status).toBe(401);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
});
