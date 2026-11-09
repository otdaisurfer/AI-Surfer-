import { describe, expect, it, vi } from "vitest";
import { handleRouteStatus } from "./route-status";

function request(path: string) {
  return new Request(`https://otdaisurfer.surf${path}`);
}

describe("handleRouteStatus", () => {
  it.each([
    "/",
    "/pricing",
    "/login",
    "/wave-audit",
    "/audit/success?session_id=test",
    "/audit/intake?session_id=test",
    "/audit/report/test-order",
    "/members/products/wave-scout",
  ])("keeps known application route %s successful", async (path) => {
    const next = vi.fn(async () => new Response("app shell", { status: 200 }));
    const response = await handleRouteStatus(request(path), next);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("app shell");
  });

  it.each([
    "/wave-audit",
    "/audit/success?session_id=test",
    "/audit/intake?session_id=test",
    "/audit/report/test-order",
    "/members/products/wave-scout",
  ])("serves the SPA shell when a direct deep link %s reaches Pages as 404", async (path) => {
    const next = vi.fn(async () => new Response("not found", { status: 404 }));
    const spaFallback = vi.fn(async () => new Response("app shell", { status: 200 }));
    const response = await handleRouteStatus(request(path), next, spaFallback);
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("app shell");
    expect(spaFallback).toHaveBeenCalledOnce();
  });

  it.each([
    "/blog/",
    "/blog/our-story/",
    "/blog/building-ai-surfer-one-wave-at-a-time-episode-1/",
  ])("keeps existing journal assets at %s successful", async (path) => {
    const response = await handleRouteStatus(request(path), async () => new Response("article", { status: 200 }));
    expect(response.status).toBe(200);
    expect(await response.text()).toBe("article");
  });

  it("does not substitute the app shell for a missing static article", async () => {
    const fallback = vi.fn(async () => new Response("app shell"));
    const response = await handleRouteStatus(request("/blog/building-ai-surfer-one-wave-at-a-time-episode-1/"), async () => new Response("missing", { status: 404 }), fallback);
    expect(response.status).toBe(404);
    expect(fallback).not.toHaveBeenCalled();
  });

  it("keeps unknown journal articles as 404", async () => {
    const response = await handleRouteStatus(request("/blog/no-such-episode/"), async () => new Response("app shell"));
    expect(response.status).toBe(404);
  });

  it("returns the app shell with a real 404 status for unknown routes", async () => {
    const next = vi.fn(async () => new Response("app shell", { status: 200, headers: { "Content-Type": "text/html; charset=utf-8" } }));
    const response = await handleRouteStatus(request("/__healthcheck-not-found__"), next);
    expect(response.status).toBe(404);
    expect(response.headers.get("Content-Type")).toBe("text/html; charset=utf-8");
    expect(await response.text()).toBe("app shell");
  });

  it("preserves static assets and existing error responses", async () => {
    const assetResponse = await handleRouteStatus(request("/assets/app.js"), async () => new Response("js", { status: 200 }));
    const missingResponse = await handleRouteStatus(request("/missing.png"), async () => new Response("missing", { status: 404 }));
    expect(assetResponse.status).toBe(200);
    expect(missingResponse.status).toBe(404);
  });
});
