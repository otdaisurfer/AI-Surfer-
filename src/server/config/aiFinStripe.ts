export const AI_FIN_PACKAGE_PRICE_ENV = {
  "Wave Starter": "STRIPE_PRICE_WAVE_STARTER",
  "Wave Builder": "STRIPE_PRICE_WAVE_BUILDER",
  "Tsunami Growth": "STRIPE_PRICE_TSUNAMI_GROWTH",
} as const;

export type AiFinPackage = keyof typeof AI_FIN_PACKAGE_PRICE_ENV;

export function getAiFinStripePriceId(packageName: AiFinPackage) {
  const envName = AI_FIN_PACKAGE_PRICE_ENV[packageName];
  const value = process.env[envName]?.trim();
  return value ? { configured: true as const, priceId: value, envName } : { configured: false as const, priceId: null, envName };
}
