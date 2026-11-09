import { getServiceOffer, type ServiceOffer } from "./serviceOffers";

export type ImplementationOffer = ServiceOffer;

export function getImplementationOffer(slug?: string): ImplementationOffer | null {
  return getServiceOffer(slug) ?? null;
}
