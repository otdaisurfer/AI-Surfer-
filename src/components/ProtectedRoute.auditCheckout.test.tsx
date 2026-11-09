import { renderToString } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../context/AuthContext", () => ({
  useAuth: () => ({ session: null, loading: false }),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    Navigate: ({ state }: { state?: { from?: string } }) => (
      <div data-testid="redirect">{state?.from ?? "missing"}</div>
    ),
  };
});

import ProtectedRoute from "./ProtectedRoute";

const submissionId = "5ed95f2f-1321-4aa8-bc88-f8f952cc6975";

beforeEach(() => {
  window.sessionStorage.clear();
});

describe("ProtectedRoute AEO checkout handoff", () => {
  it("moves the tab-scoped submission id into the auth return URL", () => {
    window.sessionStorage.setItem(
      "ai-surfer:aeo-checkout-context",
      JSON.stringify({ submissionId, email: "surfer@example.com" }),
    );

    const html = renderToString(
      <MemoryRouter initialEntries={["/audit/checkout"]}>
        <ProtectedRoute>
          <div>checkout</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(html).toContain(`/audit/checkout?submission_id=${submissionId}`);
  });
});
