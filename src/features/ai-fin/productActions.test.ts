import { describe, expect, it } from "vitest";
import { getAiFinProductAction } from "./productActions";

describe("AI Fin product actions", () => {
  it("routes Wave Starter to live Stripe checkout", () => {
    expect(getAiFinProductAction("wave-starter")).toEqual(expect.objectContaining({
      href: "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b",
      external: true,
      funnelEvent: "checkout_start",
    }));
  });

  it("routes higher-tier recommendations to the live strategy-call booking flow", () => {
    for (const productId of ["wave-builder", "tsunami-growth"] as const) {
      expect(getAiFinProductAction(productId)).toEqual(expect.objectContaining({
        href: "https://calendly.com/oceantidedrop/new-meeting",
        external: true,
        funnelEvent: "strategy_call_click",
      }));
    }
  });

  it("keeps diagnostic recommendations on internal site paths", () => {
    expect(getAiFinProductAction("free-wave-check")).toEqual(expect.objectContaining({
      href: "/wave-check",
      funnelEvent: "recommendation_cta_click",
    }));
    expect(getAiFinProductAction("aeo-wave-audit")).toEqual(expect.objectContaining({
      href: "/wave-audit",
      funnelEvent: "recommendation_cta_click",
    }));
  });
});
