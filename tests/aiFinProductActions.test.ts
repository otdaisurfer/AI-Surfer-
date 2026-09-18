import { describe, expect, it } from "vitest";
import { getAiFinProductAction } from "../src/features/ai-fin/productActions";

describe("AI Fin product actions", () => {
  it("routes the free Wave Check to the diagnostic flow", () => {
    expect(getAiFinProductAction("free-wave-check")).toEqual({
      label: "Start Free AI Wave Check",
      href: "/wave-check",
    });
  });

  it("routes the AEO Wave Audit to its public entry page", () => {
    expect(getAiFinProductAction("aeo-wave-audit")).toEqual({
      label: "Explore the AEO Wave Audit",
      href: "/wave-audit",
    });
  });

  it("routes Wave Starter directly to Stripe checkout", () => {
    expect(getAiFinProductAction("wave-starter")).toEqual({
      label: "Buy Wave Starter",
      href: "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b",
      external: true,
    });
  });

  it("routes higher-touch offers to the strategy-call pricing path", () => {
    expect(getAiFinProductAction("wave-builder")?.href).toBe("/pricing");
    expect(getAiFinProductAction("tsunami-growth")?.href).toBe("/pricing");
  });

  it("returns null when AI Fin has no recommendation yet", () => {
    expect(getAiFinProductAction(null)).toBeNull();
  });
});
