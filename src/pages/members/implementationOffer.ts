export type ImplementationOffer =
  | {
      kind: "checkout";
      label: string;
      price: number;
      checkoutUrl: string;
      cta: string;
    }
  | {
      kind: "high-touch";
      label: string;
      cta: string;
      path: string;
    };

const WAVE_STARTER_CHECKOUT = "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b";

const OFFERS: Record<string, ImplementationOffer> = {
  "aeo-blueprint": {
    kind: "high-touch",
    label: "Wave Builder",
    cta: "Request a Wave Builder Strategy Call",
    path: "/pricing",
  },
  "wave-scout": {
    kind: "checkout",
    label: "Wave Starter",
    price: 497,
    checkoutUrl: WAVE_STARTER_CHECKOUT,
    cta: "Buy Wave Starter",
  },
  "sales-rider": {
    kind: "checkout",
    label: "Wave Starter",
    price: 497,
    checkoutUrl: WAVE_STARTER_CHECKOUT,
    cta: "Buy Wave Starter",
  },
  "content-creator": {
    kind: "checkout",
    label: "Wave Starter",
    price: 497,
    checkoutUrl: WAVE_STARTER_CHECKOUT,
    cta: "Buy Wave Starter",
  },
  "customer-care-cove": {
    kind: "checkout",
    label: "Wave Starter",
    price: 497,
    checkoutUrl: WAVE_STARTER_CHECKOUT,
    cta: "Buy Wave Starter",
  },
  "automation-architect": {
    kind: "high-touch",
    label: "Wave Builder",
    cta: "Request a Wave Builder Strategy Call",
    path: "/pricing",
  },
  "big-kahuna": {
    kind: "high-touch",
    label: "Tsunami Growth",
    cta: "Talk With AI Surfer",
    path: "/pricing",
  },
};

export function getImplementationOffer(slug?: string): ImplementationOffer | null {
  if (!slug) return null;
  return OFFERS[slug] ?? null;
}
