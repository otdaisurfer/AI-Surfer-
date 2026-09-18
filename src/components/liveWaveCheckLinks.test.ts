import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("live Wave Check links", () => {
  it("routes the homepage Free AI Wave Check to the working live path", () => {
    const source = readFileSync(
      new URL("../pages/home/SitesLanding.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("Free AI Wave Check");
    expect(source).toContain('href: "/wave-check"');
  });

  it("routes the product catalog AEO Wave Audit to the working live path", () => {
    const source = readFileSync(
      new URL("./ProductCatalog.tsx", import.meta.url),
      "utf8",
    );

    expect(source).toContain("AEO Wave Audit");
    expect(source).toContain("/wave-check");
  });
});
