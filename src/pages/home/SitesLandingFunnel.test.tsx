import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const here = dirname(fileURLToPath(import.meta.url));
const funnelCss = readFileSync(resolve(here, "SitesLandingFunnel.css"), "utf8");

describe("landing funnel responsive styles", () => {
  it("styles the funnel steps, results preview, implementation path, and focus state", () => {
    expect(funnelCss).toContain(".sites-landing .wave-check-step-grid");
    expect(funnelCss).toContain(".sites-landing .results-preview-grid");
    expect(funnelCss).toContain(".sites-landing .implementation-path");
    expect(funnelCss).toContain(".sites-landing a:focus-visible");
  });

  it("styles the founding-client offer for desktop and phone layouts", () => {
    expect(funnelCss).toContain(".sites-landing .founding-client-offer");
    expect(funnelCss).toContain(".sites-landing .founding-client-benefits");
    expect(funnelCss).toContain(".sites-landing .founding-client-actions");
  });

  it("uses the approved Ocean Tide Drop logo in the homepage brand mark", () => {
    expect(funnelCss).toContain(".sites-landing .brand-mark");
    expect(funnelCss).toContain('url("/ocean_tide_logo.png")');
  });

  it("keeps phone and reduced-motion behavior explicit", () => {
    expect(funnelCss).toContain("@media (max-width: 720px)");
    expect(funnelCss).toContain("@media (prefers-reduced-motion: reduce)");
    expect(funnelCss).toContain("grid-template-columns: 1fr");
  });
});
