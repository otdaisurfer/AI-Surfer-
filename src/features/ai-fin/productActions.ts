import type { ProductId } from "./contracts";

export type AiFinProductAction = {
  label: string;
  href: string;
  external?: boolean;
  funnelEvent: "recommendation_cta_click" | "checkout_start" | "strategy_call_click";
};

const WAVE_STARTER_CHECKOUT = "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b";
const STRATEGY_CALL_URL = "https://calendly.com/oceantidedrop/new-meeting";

const PRODUCT_ACTIONS: Record<ProductId, AiFinProductAction> = {
  "free-wave-check": {
    label: "Start Free AI Wave Check",
    href: "/wave-check",
    funnelEvent: "recommendation_cta_click",
  },
  "aeo-wave-audit": {
    label: "Explore the AEO Wave Audit",
    href: "/wave-audit",
    funnelEvent: "recommendation_cta_click",
  },
  "wave-starter": {
    label: "Buy Wave Starter",
    href: WAVE_STARTER_CHECKOUT,
    external: true,
    funnelEvent: "checkout_start",
  },
  "wave-builder": {
    label: "Request a Strategy Call",
    href: STRATEGY_CALL_URL,
    external: true,
    funnelEvent: "strategy_call_click",
  },
  "tsunami-growth": {
    label: "Talk With AI Surfer",
    href: STRATEGY_CALL_URL,
    external: true,
    funnelEvent: "strategy_call_click",
  },
};

export function getAiFinProductAction(productId?: ProductId | null) {
  if (!productId) return null;
  return PRODUCT_ACTIONS[productId];
}
