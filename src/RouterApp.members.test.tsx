import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import RouterApp from "./RouterApp";

vi.mock("./context/AuthContext", () => ({
  useAuth: () => ({
    session: { user: { id: "surfer-1", email: "surfer@example.com", app_metadata: { role: "owner" } } },
    user: { id: "surfer-1", email: "surfer@example.com", app_metadata: { role: "owner" } },
    loading: false,
    signOut: vi.fn(),
  }),
}));

describe("members route", () => {
  it("opens pricing with distinct membership, service, and optional support checkouts", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/members/pricing"]}><RouterApp /></MemoryRouter>,
    );
    const container = document.createElement("div");
    container.innerHTML = html;
    const links = [...container.querySelectorAll<HTMLAnchorElement>('a[href^="https://buy.stripe.com/"]')];
    expect(container.textContent).toContain("Members Pricing & Payments");
    expect(container.textContent).toContain("$17");
    expect(container.textContent).toContain("they do not change your workspace tier");
    expect(container.textContent).toContain("renews monthly until cancelled");
    expect(links).toHaveLength(25);
    expect(new Set(links.map((link) => link.href)).size).toBe(25);
    expect(links.find((link) => link.textContent?.includes("Join AI SURFER"))?.href).toBe("https://buy.stripe.com/cNi00j5BFcFAcDg7RR4gg03");
    expect(links.filter((link) => link.textContent?.startsWith("Subscribe to"))).toHaveLength(12);
    expect(container.textContent).toContain("Free AI Wave Check — $0");
  });

  it("shows the dashboard over the members command-deck background", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/members"]}>
        <RouterApp />
      </MemoryRouter>,
    );

    expect(html).toContain("Welcome to your AI-Surfer Dashboard.");
    expect(html).toContain(
      'background-image:url(&quot;/OTD-AI-Surfer-Members-bg.png&quot;)',
    );
    expect(html).toContain("<strong>Owner</strong>");
    expect(html).not.toContain("Verifying your membership");
  });

  it("opens a product for an authenticated surfer without asking them to sign in again", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/members/products/wave-scout"]}>
        <RouterApp />
      </MemoryRouter>,
    );

    expect(html).toContain("Loading your product access");
    expect(html).toContain(
      'background-image:url(&quot;/OTD-AI-Surfer-Members-bg.png&quot;)',
    );
    expect(html).not.toContain("Verifying your membership");
    expect(html).not.toContain("Members only");
    expect(html).not.toContain("Sign in");
  });
});
