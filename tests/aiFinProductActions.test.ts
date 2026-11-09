import { describe, expect, it } from "vitest";
import { getAiFinProductAction } from "../src/features/ai-fin/productActions";

describe("AI Fin product actions", () => {
  it("routes the free Wave Check to the diagnostic flow", () => {
    expect(getAiFinProductAction("free-wave-check")).toEqual(expect.objectContaining({
      label: "Start Free AI Wave Check",
      href: "/wave-check",
      funnelEvent: "recommendation_cta_click",
    }));
  });

  it("routes the AEO Wave Audit to its public entry page", () => {
    expect(getAiFinProductAction("aeo-wave-audit")).toEqual(expect.objectContaining({
      label: "Explore the AEO Wave Audit",
      href: "/wave-audit",
      funnelEvent: "recommendation_cta_click",
    }));
  });

  it("routes Wave Starter directly to Stripe checkout", () => {
    expect(getAiFinProductAction("wave-starter")).toEqual(expect.objectContaining({
      label: "Buy Wave Starter",
      href: "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b",
      external: true,
      funnelEvent: "checkout_start",
    }));
  });

  it("routes higher-touch offers to the live strategy-call flow", () => {
    for (const productId of ["wave-builder", "tsunami-growth"] as const) {
      expect(getAiFinProductAction(productId)).toEqual(expect.objectContaining({
        href: "https://calendly.com/oceantidedrop/new-meeting",
        external: true,
        funnelEvent: "strategy_call_click",
      }));
    }
  });

  it("returns null when AI Fin has no recommendation yet", () => {
    expect(getAiFinProductAction(null)).toBeNull();
  });
});
