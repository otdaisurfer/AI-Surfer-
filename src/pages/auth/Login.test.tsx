import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
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

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{`${location.pathname}${location.search}${location.hash}`}</div>;
}

async function renderLogin(from?: string) {
  const { default: Login } = await import("./Login");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={[{ pathname: "/login", state: from === undefined ? undefined : { from } }]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return { container, root };
}

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ external: { email: true, google: true } }),
  }));
});

afterEach(() => {
  vi.clearAllMocks();
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  document.body.replaceChildren();
});

describe("Login return navigation", () => {
  it("sends password recovery emails back to the reset-password screen", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authMocks.resetPasswordForEmail.mockResolvedValue({ data: {}, error: null });
    const { container, root } = await renderLogin();
    const forgotPasswordLink = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Forgot Password?");
    await act(async () => forgotPasswordLink?.click());
    const emailInput = container.querySelector<HTMLInputElement>('input[type="email"]');
    const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    await act(async () => {
      setInputValue?.call(emailInput, "surfer@example.com");
      emailInput?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(authMocks.resetPasswordForEmail).toHaveBeenCalledWith("surfer@example.com", { redirectTo: "https://otdaisurfer.surf/reset-password" });
    await act(async () => root.unmount());
  });

  it("guides a surfer to confirmation when signup loses the response after reaching Supabase", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authMocks.signUp.mockResolvedValue({ data: { user: null, session: null }, error: new Error("NetworkError when attempting to fetch resource.") });
    const { container, root } = await renderLogin();
    const createAccountLink = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Create Account");
    await act(async () => createAccountLink?.click());
    const emailInput = container.querySelector<HTMLInputElement>('input[type="email"]');
    const passwordInput = container.querySelector<HTMLInputElement>('input[type="password"]');
    const setInputValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
    await act(async () => {
      setInputValue?.call(emailInput, "surfer@example.com");
      emailInput?.dispatchEvent(new Event("input", { bubbles: true }));
      setInputValue?.call(passwordInput, "wave-rider-123");
      passwordInput?.dispatchEvent(new Event("input", { bubbles: true }));
    });
    await act(async () => {
      container.querySelector("form")?.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
    expect(container.textContent).toContain("Your account request may have reached us");
    expect(container.textContent).not.toContain("NetworkError when attempting to fetch resource");
    await act(async () => root.unmount());
  });

  it("returns an existing session to the complete protected URL", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: { user: { id: "surfer-1" } } }, error: null });
    const { container, root } = await renderLogin("/launch-desk?tab=plan#risks");
    expect(container.querySelector('[data-testid="location"]')?.textContent).toBe("/launch-desk?tab=plan#risks");
    await act(async () => root.unmount());
  });

  it("returns an existing session to the protected AEO checkout handoff", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: { user: { id: "surfer-1" } } }, error: null });
    const { container, root } = await renderLogin("/audit/checkout");
    expect(container.querySelector('[data-testid="location"]')?.textContent).toBe("/audit/checkout");
    await act(async () => root.unmount());
  });

  it("rejects an external return URL and falls back to members", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: { user: { id: "surfer-1" } } }, error: null });
    const { container, root } = await renderLogin("https://example.com/phishing");
    expect(container.querySelector('[data-testid="location"]')?.textContent).toBe("/members");
    await act(async () => root.unmount());
  });

  it("rejects a backslash network path and falls back to members", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: { user: { id: "surfer-1" } } }, error: null });
    const { container, root } = await renderLogin("/\\evil.example/phishing");
    expect(container.querySelector('[data-testid="location"]')?.textContent).toBe("/members");
    await act(async () => root.unmount());
  });

  it("restores the protected destination after a Google OAuth round trip", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authMocks.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
    const firstRender = await renderLogin("/launch-desk?tab=plan#risks");
    const googleButton = Array.from(firstRender.container.querySelectorAll("button")).find((button) => button.textContent?.includes("Sign in with Google"));
    await act(async () => googleButton?.click());
    expect(window.sessionStorage.getItem("ai-surfer:auth-return-path")).toBe("/launch-desk?tab=plan#risks");
    await act(async () => firstRender.root.unmount());
    authMocks.getSession.mockResolvedValue({ data: { session: { user: { id: "surfer-1" } } }, error: null });
    const secondRender = await renderLogin();
    expect(secondRender.container.querySelector('[data-testid="location"]')?.textContent).toBe("/launch-desk?tab=plan#risks");
    expect(window.sessionStorage.getItem("ai-surfer:auth-return-path")).toBeNull();
    await act(async () => secondRender.root.unmount());
  });

  it("recovers when Google sign-in rejects instead of leaving all controls disabled", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authMocks.signInWithOAuth.mockRejectedValue(new Error("Connection failed"));
    const { container, root } = await renderLogin();
    const button = Array.from(container.querySelectorAll("button")).find((item) => item.textContent?.includes("Sign in with Google"))!;
    await act(async () => button.click());
    expect(container.textContent).toContain("Connection failed");
    expect(button.disabled).toBe(false);
    expect(container.textContent).not.toContain("Connecting...");
    await act(async () => root.unmount());
  });

  it("recovers when Google returns no navigation URL", async () => {
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    authMocks.signInWithOAuth.mockResolvedValue({ data: {}, error: null });
    const { container, root } = await renderLogin();
    const button = Array.from(container.querySelectorAll("button")).find((item) => item.textContent?.includes("Sign in with Google"))!;
    await act(async () => button.click());
    expect(container.textContent).toContain("did not return a sign-in link");
    expect(button.disabled).toBe(false);
    await act(async () => root.unmount());
  });

  it("offers email sign-in instead of a broken Google button when Google is disabled", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ external: { email: true, google: false } }) }));
    authMocks.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const { container, root } = await renderLogin();
    expect(container.textContent).not.toContain("Sign in with Google");
    expect(container.textContent).toContain("Google sign-in is temporarily unavailable. Please use email below.");
    await act(async () => root.unmount());
  });
});

