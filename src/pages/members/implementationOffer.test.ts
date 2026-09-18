import { describe, expect, it } from "vitest";
import { getImplementationOffer } from "./implementationOffer";

describe("getImplementationOffer", () => {
  it.each([
    ["wave-scout"],
    ["sales-rider"],
    ["content-creator"],
    ["customer-care-cove"],
  ])("maps %s to Wave Starter", (slug) => {
    expect(getImplementationOffer(slug)).toEqual({
      kind: "checkout",
      label: "Wave Starter",
      price: 497,
      checkoutUrl: "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b",
      cta: "Buy Wave Starter",
    });
  });

  it("maps AEO Blueprint to Wave Builder", () => {
    expect(getImplementationOffer("aeo-blueprint")).toEqual({
      kind: "high-touch",
      label: "Wave Builder",
      cta: "Request a Wave Builder Strategy Call",
      path: "/pricing",
    });
  });

  it("maps Automation Architect to Wave Builder", () => {
    expect(getImplementationOffer("automation-architect")).toEqual({
      kind: "high-touch",
      label: "Wave Builder",
      cta: "Request a Wave Builder Strategy Call",
      path: "/pricing",
    });
  });

  it("maps Big Kahuna to Tsunami Growth", () => {
    expect(getImplementationOffer("big-kahuna")).toEqual({
      kind: "high-touch",
      label: "Tsunami Growth",
      cta: "Talk With AI Surfer",
      path: "/pricing",
    });
  });

  it("returns null for an unknown product", () => {
    expect(getImplementationOffer("not-a-product")).toBeNull();
  });
});
