import { describe, expect, it } from "vitest";
import { getReportSellRoute } from "./reportSellRoute";

describe("getReportSellRoute", () => {
  it.each([
    ["AEO Visibility Implementation", "/members/products/aeo-blueprint", "Build My AEO Visibility Plan"],
    ["Customer Question Map + AEO Content Implementation", "/members/products/content-creator", "Build My AEO Content System"],
    ["Entity Authority Optimization", "/members/products/aeo-blueprint", "Strengthen My Entity Authority"],
    ["Technical AEO Implementation", "/members/products/aeo-blueprint", "Fix My Technical AEO"],
    ["Wave Scout", "/members/products/wave-scout", "See How Wave Scout Can Help"],
    ["Sales Rider", "/members/products/sales-rider", "Fix My Sales Follow-Up"],
    ["Content Creator", "/members/products/content-creator", "Build My Authority Content"],
    ["Customer Care Cove", "/members/products/customer-care-cove", "Improve My Customer Support"],
    ["Automation Architect", "/members/products/automation-architect", "Map My Automation Plan"],
    ["Big Kahuna", "/members/products/big-kahuna", "Talk Strategy With Big Kahuna"],
  ])("routes %s to its focused solution page", (recommendation, path, cta) => {
    expect(getReportSellRoute(recommendation)).toEqual({ path, cta });
  });

  it("falls back to members for an unknown recommendation", () => {
    expect(getReportSellRoute("Something New")).toEqual({
      path: "/members",
      cta: "Help Me Implement This",
    });
  });
});
