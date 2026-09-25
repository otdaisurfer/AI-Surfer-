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

  it("keeps the approved two-card launch focus", () => {
    expect(source).toContain('name: "Free AI Wave Check™"');
    expect(source).toContain('name: "Lead Leak Binder"');
    expect(source).toContain('href: "/wave-check"');
    expect(source).toContain('href: "#lead-leak-finder"');
    expect(source).not.toContain('name: "Customer Care Cove™"');
  });
});
