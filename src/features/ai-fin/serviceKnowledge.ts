import { MEMBERSHIP, SERVICE_OFFERS, SUPPORT_TERMS } from '../../pages/members/serviceOffers';
import { memberTools } from '../../pages/members/memberTools';

const money = (price: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price);

export function describeService(offer: (typeof SERVICE_OFFERS)[number]): string {
  return `${offer.name}: ${offer.description} ${money(offer.price)} one-time. Optional support is ${money(offer.support.price)}/month: ${offer.support.scope} Confirm scope before purchasing. Services and support do not change your member workspace tier.`;
}

export function describeMembership(): string {
  return `${MEMBERSHIP.name}: ${money(MEMBERSHIP.price)}/month for Bronze Builder Access to the workspaces assigned to that tier. Done-for-you services and support are separate. Tools include AI SURFER Prompt Architect and ${memberTools.map(tool => tool.name).join(', ')}. Tool access depends on your tier; membership is not unlimited done-for-you implementation.`;
}

export function serviceCatalogKnowledge(): string {
  return `Current public service catalog, shared with Members pricing:\n${SERVICE_OFFERS.map(describeService).join('\n')}\n${describeMembership()}\n${SUPPORT_TERMS}\nReports and blueprints provide recommendations; implementation is separate. Free AI Wave Check is $0. Wave Builder and Tsunami Growth are broader implementation packages, separate from the named services. Never describe the three implementation packages as the entire catalog. For a general product question, introduce assessments, reports/blueprints, the six agents, membership/tools, and implementation packages. Use the catalog for prices; never infer automatic publishing, calling, CRM access or workspace access from a purchase.`;
}

export function productOverview(): string {
  return `We offer the Free AI Wave Check; diagnostics and planning services including ${SERVICE_OFFERS.filter(offer => /audit|finder|report|blueprint/.test(offer.slug)).map(offer => offer.name).join(', ')}; and six AI services: Wave Scout (lead discovery), Sales Rider (sales follow-up), Content Creator (content), Customer Care Cove (customer support), Automation Architect (workflows), and Big Kahuna (strategy). AI SURFER Membership is ${money(MEMBERSHIP.price)}/month, with tools such as AI SURFER Prompt Architect and AI Surfer Content Factory; access depends on your tier. Wave Starter, Wave Builder, and Tsunami Growth are implementation packages. Monthly support is optional and purchased separately. What would you like to improve first?`;
}

export function namedServiceAnswer(message: string): string | null {
  const normalized = message.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const service = SERVICE_OFFERS.find(offer => normalized.includes(offer.name.toLowerCase()) || normalized.includes(offer.name.toLowerCase().replace(/^ai /, '')));
  if (service) return describeService(service);
  if (/membership|members area|prompt architect|content factory/.test(normalized)) return describeMembership();
  return null;
}

export function servicePricingOverview(): string {
  return `${SERVICE_OFFERS.map(offer => `${offer.name}: ${money(offer.price)} one-time; optional support ${money(offer.support.price)}/month.`).join("\n")}\n${MEMBERSHIP.name}: ${money(MEMBERSHIP.price)}/month. Free AI Wave Check: $0. ${SUPPORT_TERMS} Confirm scope before purchasing.`;
}
