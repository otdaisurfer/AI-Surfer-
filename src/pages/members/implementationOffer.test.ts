import { describe, expect, it } from "vitest";
import { getImplementationOffer } from "./implementationOffer";

describe("product service offers", () => {
  it("routes Sales Rider to its own service and support, rather than Wave Starter", () => {
    const sales = getImplementationOffer("sales-rider")!;
    const starter = getImplementationOffer("wave-starter")!;
    expect(sales.name).toBe("Sales Rider");
    expect(sales.price).toBe(1497);
    expect(sales.support.price).toBe(297);
    expect(sales.checkoutUrl).not.toBe(starter.checkoutUrl);
    expect(sales.support.checkoutUrl).not.toBe(sales.checkoutUrl);
  });

  it("offers Big Kahuna as a focused strategy engagement", () => {
    expect(getImplementationOffer("big-kahuna")).toMatchObject({ name: "Big Kahuna", price: 997, support: { price: 297, minutes: 120 } });
    expect(getImplementationOffer("big-kahuna")?.description).toContain("quoted separately");
  });

  it("offers both blueprints and the opportunity report", () => {
    for (const slug of ["aeo-blueprint", "automation-blueprint", "ai-opportunity-report"]) {
      expect(getImplementationOffer(slug)?.checkoutUrl).toMatch(/^https:\/\/buy\.stripe\.com\//);
    }
  });

  it("returns null for missing or unknown products", () => {
    expect(getImplementationOffer()).toBeNull();
    expect(getImplementationOffer("not-a-product")).toBeNull();
  });
});
