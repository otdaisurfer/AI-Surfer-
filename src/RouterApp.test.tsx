import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import RouterApp from "./RouterApp";
import { AuthProvider } from "./context/AuthContext";

describe("shared site branding", () => {
  it.each(["/wave-check", "/login"])(
    "keeps the centered Ocean Tide Drop emblem above %s",
    (route) => {
      const html = renderToStaticMarkup(
        <MemoryRouter initialEntries={[route]}>
          <AuthProvider><RouterApp /></AuthProvider>
        </MemoryRouter>,
      );
      const headerPosition = html.indexOf('aria-label="Ocean Tide Drop AI Surfer brand"');
      const routeContentPosition = html.indexOf('data-site-route-content="true"');
      expect(headerPosition).toBeGreaterThanOrEqual(0);
      expect(routeContentPosition).toBeGreaterThan(headerPosition);
      expect(html).toContain('data-site-emblem="true"');
      expect(html).toContain('src="/ocean_tide_logo.png"');
    },
  );

  it("renders the approved AI Surfer landing page at the site root", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Ride the Wave.");
    expect(html).toContain("Grow with AI.");
    expect(html).toContain("THE AI SURFER PRODUCT WAVE");
    expect(html).toContain('aria-label="Ocean Tide Drop AI SURFER home"');
    expect(html).toContain('data-homepage-logo="true"');
    expect(html).toContain('src="/ocean_tide_logo.png"');
    expect(html).not.toContain('aria-label="Ocean Tide Drop AI Surfer brand"');
    expect(html).toContain("The Free AI Wave Check is live");
    expect(html).toContain("Find my biggest AI opportunity");
  });

  it("keeps the seven-step revenue funnel and colored product actions on the landing page", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    const funnelStages = ["LAND", "CAPTURE", "AUDIT", "RESULTS", "SELL", "IMPLEMENT", "RETAIN"];
    const funnelStart = html.indexOf('aria-label="AI Surfer revenue funnel"');
    expect(funnelStart).toBeGreaterThanOrEqual(0);
    funnelStages.reduce((previousPosition, stage) => {
      const stagePosition = html.indexOf(`>${stage}<`, previousPosition + 1);
      expect(stagePosition).toBeGreaterThan(previousPosition);
      return stagePosition;
    }, funnelStart);
    expect(html.match(/class="product-card-cta button button-primary"/g)).toHaveLength(10);
  });

  it("makes the Free AI Wave Check the primary homepage conversion action", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider><RouterApp /></AuthProvider>
      </MemoryRouter>,
    );

    expect(html).toContain("Get My Free AI Wave Check™");
    expect(html).toContain('data-funnel-cta="hero-wave-check"');
    expect(html).toContain('href="/wave-check"');
    expect(html).not.toContain('href="https://otdaisurfer.surf/wave-check"');
  });

  it("explains the Wave Check path from assessment to implementation", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider><RouterApp /></AuthProvider>
      </MemoryRouter>,
    );

    expect(html).toContain("How the Wave Check works");
    expect(html).toContain("See your strongest AI opportunity");
    expect(html).toContain("Get a clear next step");
    expect(html).toContain("Turn the recommendation into action");
    expect(html).toContain('data-funnel-cta="midpage-wave-check"');
  });

  it("keeps products, pricing, and members connected to the funnel", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/"]}>
        <AuthProvider><RouterApp /></AuthProvider>
      </MemoryRouter>,
    );

    expect(html).toContain("THE AI SURFER PRODUCT WAVE");
    expect(html).toContain('href="/pricing"');
    expect(html).toContain('href="/members"');
    expect(html).toContain('data-funnel-cta="members"');
    expect(html).toContain('data-funnel-cta="product"');
  });

  it("opens a dedicated password-recovery screen from the email link", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/reset-password"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Set a New Password");
    expect(html).toContain("Choose a secure new password for your AI-Surfer account.");
  });

  it("renders the approved three-offer launch pricing at /pricing", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/pricing"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Wave Starter");
    expect(html).toContain("$497");
    expect(html).toContain("Wave Builder");
    expect(html).toContain("$1,997");
    expect(html).toContain("Tsunami Growth");
    expect(html).toContain("$3,997");
    expect(html).not.toContain("$197");
    expect(html).not.toContain("$2,997");
    expect(html).not.toContain("20% off");
    expect(html).not.toContain("AI SURFER 20");
    expect(html).not.toContain("AI SURFER20");
  });

  it("renders the privacy policy route", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/privacy"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Privacy Policy");
  });

  it("renders the terms route", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/terms"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Terms of Service");
  });

  it("renders audit success", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/audit/success"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Your AEO Wave Audit Is Paid");
  });

  it("renders a 404 page for unknown routes", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/not-a-route"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("That wave drifted out to sea.");
  });
});
