import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const source = readFileSync("src/pages/home/SitesLanding.tsx", "utf8");

const iconNames = [
  "discover",
  "diagnose",
  "plan",
  "implement",
  "transform",
];

describe("AI Surfer icon set", () => {
  it("keeps the journey icons on the landing page", () => {
    for (const iconName of iconNames) {
      const iconPath = `/icons/ai-surfer/${iconName}.webp`;
      expect(source).toContain(iconPath);
      expect(existsSync(`public${iconPath}`), `Missing ${iconPath}`).toBe(true);
    }
  });

  it("adds Customer Care Cove to the service cards", () => {
    expect(source).toContain('name: "Customer Care Cove™"');
    expect(source).toContain('href: "/members/products/customer-care-cove"');
  });
});
