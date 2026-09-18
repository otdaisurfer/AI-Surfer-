import type { ProductId } from "./contracts";

export type AiFinProductAction = {
  label: string;
  href: string;
  external?: boolean;
};

const WAVE_STARTER_CHECKOUT = "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b";

const PRODUCT_ACTIONS: Record<ProductId, AiFinProductAction> = {
  "free-wave-check": {
    label: "Start Free AI Wave Check",
    href: "/wave-check",
  },
  "aeo-wave-audit": {
    label: "Explore the AEO Wave Audit",
    href: "/wave-audit",
  },
  "wave-starter": {
    label: "Buy Wave Starter",
    href: WAVE_STARTER_CHECKOUT,
    external: true,
  },
  "wave-builder": {
    label: "Request a Strategy Call",
    href: "/pricing",
  },
  "tsunami-growth": {
    label: "Talk With AI Surfer",
    href: "/pricing",
  },
};

export function getAiFinProductAction(productId?: ProductId | null) {
  if (!productId) return null;
  return PRODUCT_ACTIONS[productId];
}
