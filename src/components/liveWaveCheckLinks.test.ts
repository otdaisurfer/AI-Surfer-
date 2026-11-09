import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("live Wave Check links", () => {
  it.each([
    "../pages/home/SitesLanding.tsx",
    "./ProductCatalog.tsx",
  ])("%s routes its Wave Check CTA to the working live path", (relativePath) => {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

    expect(source).toContain("/wave-check");
    expect(source).not.toContain("https://otdaisurfer.surf/wave-check");
  });
});
