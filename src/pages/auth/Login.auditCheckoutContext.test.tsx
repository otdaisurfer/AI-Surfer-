import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const authMocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  signInWithOAuth: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
}));

vi.mock("../../lib/supabase", () => ({
  supabaseUrl: "https://project.supabase.co",
  supabaseAnonKey: "publishable-test-key",
  supabase: { auth: authMocks },
}));

const submissionId = "5ed95f2f-1321-4aa8-bc88-f8f952cc6975";

beforeEach(() => {
  window.sessionStorage.clear();
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ external: { email: true, google: false } }),
  }));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  document.body.replaceChildren();
});

describe("AEO checkout context after email confirmation", () => {
  it("rebuilds sessionStorage from the return URL before entering checkout", async () => {
    authMocks.getSession.mockResolvedValue({
      data: { session: { user: { id: "surfer-1", email: "buyer@example.com" } } },
      error: null,
    });

    const { default: Login } = await import("./Login");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);
    const returnTo = `/audit/checkout?submission_id=${submissionId}`;

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/login?returnTo=${encodeURIComponent(returnTo)}`]}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/audit/checkout" element={<div>checkout</div>} />
          </Routes>
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(window.sessionStorage.getItem("ai-surfer:aeo-checkout-context")).toBe(
      JSON.stringify({ submissionId, email: "buyer@example.com" }),
    );

    await act(async () => root.unmount());
  });
});
