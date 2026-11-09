import { describe, expect, it, vi } from "vitest";
import { handleSiteHealth } from "./site-health";

const env = {
  CLOUDFLARE_ACCOUNT_ID: "account-123",
  CLOUDFLARE_BROWSER_TOKEN: "browser-token",
  SITE_HEALTH_API_KEY: "health-secret",
};

function healthRequest(apiKey = "health-secret") {
  return new Request("https://otdaisurfer.surf/api/site-health", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
}

describe("handleSiteHealth", () => {
  it("rejects callers that do not know the private health-check key", async () => {
    const fetchBrowserRun = vi.fn();

    const response = await handleSiteHealth(healthRequest("wrong-key"), env, fetchBrowserRun);

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Unauthorized health check.",
    });
    expect(fetchBrowserRun).not.toHaveBeenCalled();
  });

  it("audits the fixed AI Surfer site and returns usable health evidence", async () => {
    const fetchBrowserRun = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      expect(String(input)).toBe(
        "https://api.cloudflare.com/client/v4/accounts/account-123/browser-rendering/snapshot",
      );
      expect(init?.headers).toEqual({
        Authorization: "Bearer browser-token",
        "Content-Type": "application/json",
      });
      expect(JSON.parse(String(init?.body))).toEqual({
        url: "https://otdaisurfer.surf/",
        formats: ["screenshot", "markdown", "accessibilityTree"],
        gotoOptions: {
          waitUntil: "networkidle2",
          timeout: 30000,
        },
        screenshotOptions: {
          fullPage: true,
        },
        viewport: {
          width: 1440,
          height: 900,
          deviceScaleFactor: 1,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          result: {
            screenshot: "base64-screenshot",
            markdown: "# Ocean Tide Drop AI SURFER\n\nRide the Wave.",
            accessibilityTree: {
              role: "RootWebArea",
              name: "Ocean Tide Drop AI SURFER",
              children: [
                { role: "heading", name: "Ride the Wave", level: 1 },
                { role: "link", name: "Members" },
              ],
            },
          },
          meta: {
            status: 200,
            title: "Ocean Tide Drop AI SURFER",
          },
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Browser-Ms-Used": "1480",
          },
        },
      );
    });

    const response = await handleSiteHealth(healthRequest(), env, fetchBrowserRun);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      target: "https://otdaisurfer.surf/",
      status: "healthy",
      browserMsUsed: 1480,
      page: {
        httpStatus: 200,
        title: "Ocean Tide Drop AI SURFER",
      },
      signals: {
        hasScreenshot: true,
        markdownCharacters: 43,
        accessibilityNodes: 3,
      },
      issues: [],
      evidence: {
        screenshot: "base64-screenshot",
        markdown: "# Ocean Tide Drop AI SURFER\n\nRide the Wave.",
      },
    });
  });

  it("returns a safe gateway error when Browser Run fails", async () => {
    const fetchBrowserRun = vi.fn(async () =>
      new Response(
        JSON.stringify({
          success: false,
          errors: [{ message: "upstream detail containing browser-token" }],
        }),
        { status: 429, headers: { "Content-Type": "application/json" } },
      ),
    );

    const response = await handleSiteHealth(healthRequest(), env, fetchBrowserRun);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Cloudflare Browser Run could not complete the health check.",
      upstreamStatus: 429,
    });
  });

  it("turns Browser Run network failures into a stable service response", async () => {
    const fetchBrowserRun = vi.fn(async () => {
      throw new Error("socket failed with browser-token");
    });

    const response = await handleSiteHealth(healthRequest(), env, fetchBrowserRun);

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      ok: false,
      error: "Cloudflare Browser Run could not be reached.",
    });
  });
});
