import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const authMocks = vi.hoisted(() => ({
  onAuthStateChange: vi.fn(),
  updateUser: vi.fn(),
}));

type RecoverySession = { user: { id: string } } | null;
type AuthChangeCallback = (event: string, session: RecoverySession) => void;
let authChangeCallback: AuthChangeCallback | undefined;

vi.mock("../../lib/supabase", () => ({
  supabase: { auth: authMocks },
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

async function renderResetPassword() {
  const { default: ResetPassword } = await import("./ResetPassword");
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);

  await act(async () => {
    root.render(
      <MemoryRouter initialEntries={["/reset-password"]}>
        <Routes>
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>,
    );
    await new Promise((resolve) => setTimeout(resolve, 0));
  });

  return { container, root };
}

beforeEach(() => {
  authMocks.onAuthStateChange.mockImplementation((callback: AuthChangeCallback) => {
    authChangeCallback = callback;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  authMocks.updateUser.mockResolvedValue({ data: {}, error: null });
});

afterEach(() => {
  vi.clearAllMocks();
  authChangeCallback = undefined;
  window.history.replaceState({}, "", "/");
  document.body.replaceChildren();
});

describe("password recovery", () => {
  it("updates the password from a valid recovery session and enters members", async () => {
    const { container, root } = await renderResetPassword();

    expect(container.textContent).toContain("Checking your secure reset link");
    expect(container.textContent).not.toContain("invalid or has expired");

    await act(async () => {
      authChangeCallback?.("PASSWORD_RECOVERY", { user: { id: "surfer-1" } });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="password"]');
    expect(inputs).toHaveLength(2);
    const setInputValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    await act(async () => {
      setInputValue?.call(inputs[0], "new-wave-password");
      inputs[0]?.dispatchEvent(new Event("input", { bubbles: true }));
      setInputValue?.call(inputs[1], "new-wave-password");
      inputs[1]?.dispatchEvent(new Event("input", { bubbles: true }));
    });

    await act(async () => {
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(authMocks.updateUser).toHaveBeenCalledWith({
      password: "new-wave-password",
    });
    expect(container.querySelector('[data-testid="location"]')?.textContent).toBe(
      "/members",
    );

    await act(async () => root.unmount());
  });

  it("rejects an ordinary signed-in session without a recovery event", async () => {
    const { container, root } = await renderResetPassword();

    await act(async () => {
      authChangeCallback?.("INITIAL_SESSION", { user: { id: "surfer-1" } });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(0);
    expect(container.textContent).toContain("This reset link is invalid or has expired");

    await act(async () => root.unmount());
  });

  it("rejects an expired callback even when another account is signed in", async () => {
    window.history.replaceState(
      {},
      "",
      "/reset-password#error_code=otp_expired&error_description=Email+link+is+invalid",
    );
    const { container, root } = await renderResetPassword();

    await act(async () => {
      authChangeCallback?.("SIGNED_IN", { user: { id: "different-surfer" } });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.querySelectorAll('input[type="password"]')).toHaveLength(0);
    expect(container.textContent).toContain("This reset link is invalid or has expired");

    await act(async () => root.unmount());
  });

  it("shows a safe retry message when saving the new password fails unexpectedly", async () => {
    authMocks.updateUser.mockRejectedValueOnce(new Error("network details"));
    const { container, root } = await renderResetPassword();

    await act(async () => {
      authChangeCallback?.("PASSWORD_RECOVERY", { user: { id: "surfer-1" } });
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const inputs = container.querySelectorAll<HTMLInputElement>('input[type="password"]');
    expect(inputs).toHaveLength(2);
    const setInputValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      "value",
    )?.set;

    await act(async () => {
      setInputValue?.call(inputs[0], "new-wave-password");
      inputs[0]?.dispatchEvent(new Event("input", { bubbles: true }));
      setInputValue?.call(inputs[1], "new-wave-password");
      inputs[1]?.dispatchEvent(new Event("input", { bubbles: true }));
      container.querySelector("form")?.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain(
      "We couldn't save your new password. Please try again.",
    );
    expect(container.textContent).not.toContain("network details");

    await act(async () => root.unmount());
  });
});
