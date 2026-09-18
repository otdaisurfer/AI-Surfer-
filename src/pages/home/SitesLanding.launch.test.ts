import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/pages/home/SitesLanding.tsx", "utf8");

describe("first-client homepage launch path", () => {
  it("makes the Free AI Wave Check the clear front door", () => {
    expect(source).toContain("The Free AI Wave Check is live");
    expect(source).toContain('href="/wave-check"');
    expect(source).toContain("Get My Free AI Wave Check™");
    expect(source).toContain('name: "Free AI Wave Check™"');
    expect(source).toContain('cta: "Start the Free Wave Check"');
  });

  it("does not advertise stale launch discounts or mislabeled membership pricing", () => {
    expect(source).not.toContain("20% off recurring app access");
    expect(source).not.toContain("View membership options");
    expect(source).toContain("View implementation options");
  });
});
