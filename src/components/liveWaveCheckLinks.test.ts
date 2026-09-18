import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("live Wave Check links", () => {
  it.each([
    "../pages/home/SitesLanding.tsx",
    "./ProductCatalog.tsx",
  ])("%s routes the AEO Wave Audit CTA to the working live path", (relativePath) => {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

    expect(source).toContain("AEO Wave Audit");
    expect(source).toMatch(/AEO Wave Audit[\s\S]{0,900}href:\s*["']\/wave-check["']/);
  });
});
