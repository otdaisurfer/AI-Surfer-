import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
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

beforeEach(() => {
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

describe("AEO checkout signup return", () => {
  it("sends the confirmation link back through login with the checkout destination", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authMocks.signUp.mockResolvedValue({
      data: { user: { id: "new-surfer" }, session: null },
      error: null,
    });

    const { default: Login } = await import("./Login");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[{ pathname: "/login", state: { from: "/audit/checkout" } }]}>
          <Login />
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const createAccount = Array.from(container.querySelectorAll("button")).find(
      (button) => button.textContent === "Create Account",
    );
    await act(async () => createAccount?.click());

    const emailInput = container.querySelector<HTMLInputElement>('input[type="email"]');
    const passwordInput = container.querySelector<HTMLInputElement>('input[type="password"]');
    const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;

    await act(async () => {
      setInputValue?.call(emailInput, "buyer@example.com");
      emailInput?.dispatchEvent(new Event("input", { bubbles: true }));
      setInputValue?.call(passwordInput, "wave-rider-123");
      passwordInput?.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(authMocks.signUp).toHaveBeenCalledWith({
      email: "buyer@example.com",
      password: "wave-rider-123",
      options: {
        emailRedirectTo: `${window.location.origin}/login?returnTo=%2Faudit%2Fcheckout`,
      },
    });

    await act(async () => root.unmount());
  });
});
