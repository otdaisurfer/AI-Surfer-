import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import RouterApp from "./RouterApp";
import { SERVICE_OFFERS } from "./pages/members/serviceOffers";
vi.mock("./context/AuthContext", () => ({ useAuth: () => ({ session: null, user: null, loading: false }) }));
describe("guest service purchase path", () => {
  it("shows every service and optional support checkout without signing in", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/services"]}><RouterApp /></MemoryRouter>);
    const page = document.createElement("div"); page.innerHTML = html;
    expect(page.textContent).toContain("Services & Payments");
    for (const offer of SERVICE_OFFERS) {
      const card = page.querySelector(`#${offer.slug}`);
      expect(card?.querySelector(`a[href="${offer.checkoutUrl}"]`)?.textContent).toContain(`Buy ${offer.name}`);
      expect(card?.querySelector(`a[href="${offer.support.checkoutUrl}"]`)).not.toBeNull();
    }
  });
  it("routes public product cards to their matching service instead of member login", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/pricing"]}><RouterApp /></MemoryRouter>);
    const page = document.createElement("div"); page.innerHTML = html;
    for (const slug of ["aeo-wave-audit", "wave-scout", "content-creator", "big-kahuna"]) {
      expect(page.querySelector(`a[href="/services#${slug}"]`)).not.toBeNull();
    }
  });
});
