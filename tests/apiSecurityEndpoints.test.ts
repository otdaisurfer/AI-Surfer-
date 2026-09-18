// @vitest-environment node

import type { Server } from "node:http";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { createApp } from "../src/server/createApp";

type StartedServer = {
  server: Server;
  baseUrl: string;
};

async function startServer(): Promise<StartedServer> {
  const app = createApp();

  return await new Promise((resolve) => {
    const server = app.listen(0, "127.0.0.1", () => {
      const address = server.address();
      if (!address || typeof address === "string") {
        throw new Error("Could not determine test server address");
      }

      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}`,
      });
    });
  });
}

async function stopServer(server: Server) {
  await new Promise<void>((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
}

describe("AI SURFER API security and routing", () => {
  let started: StartedServer | undefined;

  beforeEach(() => {
    process.env.NODE_ENV = "test";
    process.env.AI_SURFER_API_KEY = "test-secret";
    process.env.AI_SURFER_REQUIRE_API_KEY = "true";
    process.env.AI_SURFER_ALLOWED_ORIGINS = "https://otdaisurfer.surf";
    process.env.AI_SURFER_RATE_LIMIT = "20";
    process.env.AI_SURFER_RATE_WINDOW_SECONDS = "60";
  });

  afterEach(async () => {
    if (started) {
      await stopServer(started.server);
      started = undefined;
    }

    delete process.env.AI_SURFER_API_KEY;
    delete process.env.AI_SURFER_REQUIRE_API_KEY;
    delete process.env.AI_SURFER_ALLOWED_ORIGINS;
    delete process.env.AI_SURFER_RATE_LIMIT;
    delete process.env.AI_SURFER_RATE_WINDOW_SECONDS;
  });

  it("keeps /health public", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/health`);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.service).toBe("launch-desk-api");
  });

  it("rejects protected routes without a key", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/dashboard`);
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body.error).toBe("UNAUTHORIZED");
  });

  it("accepts X-AI-Surfer-Key for protected routes", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/dashboard`, {
      headers: { "X-AI-Surfer-Key": "test-secret" },
    });

    expect(response.status).toBe(200);
  });

  it("accepts Bearer auth for protected routes", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/dashboard`, {
      headers: { Authorization: "Bearer test-secret" },
    });

    expect(response.status).toBe(200);
  });

  it("rejects disallowed browser origins", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/dashboard`, {
      headers: {
        Origin: "https://attacker.example",
        "X-AI-Surfer-Key": "test-secret",
      },
    });
    const body = await response.json();

    expect(response.status).toBe(403);
    expect(body.error).toBe("ORIGIN_NOT_ALLOWED");
  });

  it("allows the production site origin", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/dashboard`, {
      headers: {
        Origin: "https://otdaisurfer.surf",
        "X-AI-Surfer-Key": "test-secret",
      },
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("access-control-allow-origin")).toBe("https://otdaisurfer.surf");
  });

  it("fails closed when API protection is required but the key is missing", async () => {
    delete process.env.AI_SURFER_API_KEY;
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/dashboard`);
    const body = await response.json();

    expect(response.status).toBe(503);
    expect(body.error).toBe("API_SECURITY_NOT_CONFIGURED");
  });

  it("rate-limits repeated protected requests", async () => {
    process.env.AI_SURFER_RATE_LIMIT = "2";
    started = await startServer();

    const request = () =>
      fetch(`${started!.baseUrl}/api/dashboard`, {
        headers: {
          "X-AI-Surfer-Key": "test-secret",
          "X-Forwarded-For": "203.0.113.44",
        },
      });

    expect((await request()).status).toBe(200);
    expect((await request()).status).toBe(200);

    const limited = await request();
    const body = await limited.json();

    expect(limited.status).toBe(429);
    expect(body.error).toBe("RATE_LIMIT_EXCEEDED");
    expect(limited.headers.get("retry-after")).toBeTruthy();
  });

  it.each([
    ["/api/ai-fin/leads", "INVALID_LEAD_PAYLOAD"],
    ["/api/ai-fin/audit/start", "INVALID_AUDIT_PAYLOAD"],
    ["/api/ai-fin/handoff", "INVALID_HANDOFF_PAYLOAD"],
    ["/api/ai-fin/follow-up", "INVALID_FOLLOW_UP_PAYLOAD"],
    ["/api/ai-fin/onboarding", "INVALID_ONBOARDING_PAYLOAD"],
  ])("routes %s and validates its payload", async (path, errorCode) => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AI-Surfer-Key": "test-secret",
      },
      body: JSON.stringify({}),
    });
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.error).toBe(errorCode);
  });

  it("routes Launch Desk and reports an invalid brief over SSE", async () => {
    started = await startServer();

    const response = await fetch(`${started.baseUrl}/api/launch`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-AI-Surfer-Key": "test-secret",
      },
      body: JSON.stringify({}),
    });

    const body = await response.text();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("text/event-stream");
    expect(body).toContain('"type":"error"');
  });
});
