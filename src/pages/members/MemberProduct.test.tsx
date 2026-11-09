import { act } from "react";
import { createRoot } from "react-dom/client";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const authState = vi.hoisted(() => ({
  user: {
    id: "auth-surfer-1",
    email: "surfer@example.com",
    app_metadata: {} as Record<string, string>,
  },
}));

const supabaseMocks = vi.hoisted(() => ({
  getUser: vi.fn(),
  maybeSingle: vi.fn(),
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => authState,
}));

vi.mock("../../lib/supabase", () => ({
  supabase: {
    auth: { getUser: supabaseMocks.getUser },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: supabaseMocks.maybeSingle }),
      }),
    }),
  },
}));

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname}</div>;
}

afterEach(() => {
  vi.clearAllMocks();
  authState.user.app_metadata = {};
  document.body.replaceChildren();
});

describe("MemberProduct", () => {
  it.each([
    ["ai-opportunity-report", "AI Opportunity Report"],
    ["aeo-blueprint", "AEO Blueprint"],
    ["automation-blueprint", "Automation Blueprint"],
    ["wave-scout", "Wave Scout"],
    ["sales-rider", "Sales Rider"],
    ["content-creator", "Content Creator"],
    ["automation-architect", "Automation Architect"],
    ["big-kahuna", "Big Kahuna"],
  ])("opens the catalog product %s", async (slug, productName) => {
    supabaseMocks.maybeSingle.mockResolvedValue({
      data: { tier: "Full Takeover" },
      error: null,
    });

    const { default: MemberProduct } = await import("./MemberProduct");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={[`/members/products/${slug}`]}>
          <Routes>
            <Route path="/members/products/:slug" element={<MemberProduct />} />
          </Routes>
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain(productName);
    expect(container.textContent).not.toContain("Product not found");

    await act(async () => root.unmount());
  });

  it("gives an authenticated owner full product access without a customer tier row", async () => {
    authState.user.app_metadata = { role: "owner" };
    supabaseMocks.maybeSingle.mockResolvedValue({
      data: null,
      error: null,
    });

    const { default: MemberProduct } = await import("./MemberProduct");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/members/products/wave-scout"]}>
          <Routes>
            <Route path="/members/products/:slug" element={<MemberProduct />} />
          </Routes>
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("Your Wave Scout workspace is ready.");
    expect(container.textContent).toContain("Owner");
    expect(container.textContent).not.toContain("UPGRADE REQUIRED");
    expect(supabaseMocks.maybeSingle).not.toHaveBeenCalled();

    await act(async () => root.unmount());
  });

  it("keeps an authenticated surfer on the product when a fresh auth request is unavailable", async () => {
    supabaseMocks.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Auth request unavailable"),
    });
    supabaseMocks.maybeSingle.mockResolvedValue({
      data: { tier: "Starter Access" },
      error: null,
    });

    const { default: MemberProduct } = await import("./MemberProduct");
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    await act(async () => {
      root.render(
        <MemoryRouter initialEntries={["/members/products/wave-scout"]}>
          <Routes>
            <Route path="/members/products/:slug" element={<MemberProduct />} />
            <Route path="*" element={<LocationProbe />} />
          </Routes>
        </MemoryRouter>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain("Your Wave Scout workspace is ready.");
    expect(container.textContent).toContain("Base Access");
    expect(container.textContent).not.toContain("Welcome back, Surfer");
    expect(container.querySelector('[data-testid="location"]')).toBeNull();

    await act(async () => root.unmount());
  });
});
