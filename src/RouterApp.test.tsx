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
    expect(html).not.toContain('aria-label="Ocean Tide Drop AI Surfer brand"');
    expect(html.match(/Launch wave/g)).toHaveLength(1);
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
    expect(html.match(/class="product-card-cta button button-primary"/g)).toHaveLength(9);
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
    expect(html).not.toContain("$97");
    expect(html).not.toContain("$17/month");
    expect(html).not.toContain("$2,500");
    expect(html).not.toContain("LAUNCH WEEK SPECIAL");
    expect(html).not.toContain("OCEANTIDE20");
  });

  it("renders a complete privacy policy at /privacy", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/privacy"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Privacy Policy");
    expect(html).toContain("Data We Collect");
    expect(html).toContain("Data Retention");
    expect(html).toContain("Deletion Requests");
    expect(html).toContain("Payment Information");
  });

  it("renders customer-facing terms at /terms", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/terms"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Terms of Service");
    expect(html).toContain("Services and AI Outputs");
    expect(html).toContain("Payments");
    expect(html).toContain("Customer Responsibilities");
    expect(html).toContain("Refunds and Cancellations");
  });

  it("renders the paid audit success handoff after Stripe returns", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/audit/success?session_id=cs_live_123"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("Your AEO Wave Audit Is Paid");
    expect(html).toContain("Continue to My Audit Intake");
  });

  it("renders the Wave Starter payment-success onboarding handoff", () => {
    const html = renderToStaticMarkup(
      <MemoryRouter initialEntries={["/wave-starter/success?session_id=cs_live_123"]}>
        <AuthProvider><RouterApp /></AuthProvider>
      </MemoryRouter>,
    );
    expect(html).toContain("Wave Starter Payment Received");
    expect(html).toContain("What happens next");
    expect(html).toContain("oceantidedropservice@gmail.com");
    expect(html).not.toContain("cs_live_123");
  });

  it("renders a clear not-found page for unknown public routes", () => {
    const html = renderToStaticMarkup(<MemoryRouter initialEntries={["/__healthcheck-not-found__"]}><AuthProvider><RouterApp /></AuthProvider></MemoryRouter>);
    expect(html).toContain("404");
    expect(html).toContain("That wave drifted out to sea.");
    expect(html).toContain('href="/"');
    expect(html).not.toContain("AI for your business, without the tech headache.");
  });
});