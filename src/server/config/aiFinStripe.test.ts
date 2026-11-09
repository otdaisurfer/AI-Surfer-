import { afterEach, describe, expect, it } from "vitest";
import { getAiFinStripePriceId } from "./aiFinStripe";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("AI Fin Stripe package configuration", () => {
  it("reports missing package price configuration", () => {
    delete process.env.STRIPE_PRICE_WAVE_STARTER;
    const result = getAiFinStripePriceId("Wave Starter");
    expect(result.configured).toBe(false);
    expect(result.envName).toBe("STRIPE_PRICE_WAVE_STARTER");
  });

  it("returns the configured Stripe price id for the selected package", () => {
    process.env.STRIPE_PRICE_WAVE_BUILDER = "price_test_wave_builder";
    const result = getAiFinStripePriceId("Wave Builder");
    expect(result.configured).toBe(true);
    expect(result.priceId).toBe("price_test_wave_builder");
  });
});
