// @vitest-environment node

import { describe, expect, it, vi } from "vitest";
import { AiSurferApiClient } from "../src/lib/aiSurferApiClient";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("AiSurferApiClient AI Fin chat", () => {
  it("keeps the browser receiver when using the native fetch implementation", async () => {
    const originalFetch = globalThis.fetch;
    const receiverAwareFetch = vi.fn(function (this: typeof globalThis) {
      if (this !== globalThis) {
        throw new TypeError("Illegal invocation");
      }

      return Promise.resolve(
        jsonResponse({
          answer: "Welcome to the wave.",
          recommendedProductId: null,
          knowledgeVersion: null,
          leadSaved: false,
          escalationRequired: false,
        }),
      );
    });

    globalThis.fetch = receiverAwareFetch as typeof fetch;

    try {
      const client = new AiSurferApiClient();
      await expect(
        client.chatAiFin({ mode: "public", message: "hello" }),
      ).resolves.toMatchObject({ answer: "Welcome to the wave." });
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  it("sends public AI Fin chat through the same-origin client without a server API key", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        answer: "Welcome to the wave.",
        recommendedProductId: "free-wave-check",
        knowledgeVersion: "v1",
        leadSaved: false,
        escalationRequired: false,
      }),
    );

    const client = new AiSurferApiClient({
      apiKey: "server-secret-that-must-not-reach-browser-chat",
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await client.chatAiFin({
      mode: "public",
      message: "What can AI Surfer do for my business?",
      conversation: [],
    });

    expect(result.answer).toBe("Welcome to the wave.");
    expect(fetchImpl).toHaveBeenCalledTimes(1);

    const [url, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("/api/ai-fin/chat");

    const headers = new Headers(init.headers);
    expect(headers.get("Content-Type")).toBe("application/json");
    expect(headers.get("X-AI-Surfer-Key")).toBeNull();
    expect(headers.get("Authorization")).toBeNull();
  });

  it("passes an owner Supabase access token as bearer auth", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        answer: "Owner context loaded.",
        recommendedProductId: null,
        knowledgeVersion: "owner-v1",
        leadSaved: false,
        escalationRequired: false,
      }),
    );

    const client = new AiSurferApiClient({ fetchImpl: fetchImpl as typeof fetch });

    await client.chatAiFin(
      {
        mode: "owner",
        message: "Show me our current offer positioning.",
        conversation: [],
        preview: true,
      },
      { accessToken: "owner-access-token" },
    );

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    const headers = new Headers(init.headers);

    expect(headers.get("Authorization")).toBe("Bearer owner-access-token");
    expect(headers.get("X-AI-Surfer-Key")).toBeNull();
  });

  it("forwards the abort signal used by the UI timeout", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({
        answer: "Done.",
        recommendedProductId: null,
        knowledgeVersion: null,
        leadSaved: false,
        escalationRequired: false,
      }),
    );
    const client = new AiSurferApiClient({ fetchImpl: fetchImpl as typeof fetch });
    const controller = new AbortController();

    await client.chatAiFin(
      { mode: "public", message: "hello" },
      { signal: controller.signal },
    );

    const [, init] = fetchImpl.mock.calls[0] as [string, RequestInit];
    expect(init.signal).toBe(controller.signal);
  });

  it("surfaces AI Fin error messages from the Pages endpoint", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      jsonResponse({ error: "AI Fin is temporarily unavailable" }, 503),
    );
    const client = new AiSurferApiClient({ fetchImpl: fetchImpl as typeof fetch });

    await expect(
      client.chatAiFin({ mode: "public", message: "hello" }),
    ).rejects.toThrow("AI Fin is temporarily unavailable");
  });
});
