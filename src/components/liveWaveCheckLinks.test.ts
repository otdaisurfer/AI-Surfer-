import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("live Wave Check links", () => {
  it.each([
    "../pages/home/SitesLanding.tsx",
    "./ProductCatalog.tsx",
  ])("%s keeps the Free AI Wave Check routed to the working live path", (relativePath) => {
    const source = readFileSync(new URL(relativePath, import.meta.url), "utf8");

    expect(source).toContain("Free AI Wave Check");
    expect(source).toContain("/wave-check");
  });
});
