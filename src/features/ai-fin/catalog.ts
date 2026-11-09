import type { ProblemCategory, ProductCatalogEntry, ProductId } from './contracts';

export const PRODUCT_CATALOG = Object.freeze([
  {
    id: 'free-wave-check',
    name: 'Free AI Wave Check',
    setupPriceCents: 0,
    monthlyPriceCents: null,
    effectiveDate: '2026-09-13',
    approvalSource: 'Live site',
    notes: 'Free lead-in assessment. Use this when a visitor is not ready to buy or needs help choosing the right next step.',
  },
  {
    id: 'aeo-wave-audit',
    name: 'AEO Wave Audit',
    setupPriceCents: 9_700,
    monthlyPriceCents: null,
    effectiveDate: '2026-09-13',
    approvalSource: 'Live Stripe',
    notes: 'One-time personalized 100-point AEO analysis with visibility gaps, Customer Question Map, 30-Day Wave Plan, and AI Surfer recommendation.',
  },
  {
    id: 'wave-starter',
    name: 'Wave Starter',
    setupPriceCents: 49_700,
    monthlyPriceCents: null,
    effectiveDate: '2026-09-13',
    approvalSource: 'Live site and Stripe',
    notes: 'Focused implementation sprint that turns the clearest AI opportunity into a working business system. Direct checkout is available.',
  },
  {
    id: 'wave-builder',
    name: 'Wave Builder',
    setupPriceCents: 199_700,
    monthlyPriceCents: null,
    effectiveDate: '2026-09-13',
    approvalSource: 'Live site',
    notes: 'Broader build connecting AI visibility, lead flow, follow-up, and automation. Strategy call is the next step.',
  },
  {
    id: 'tsunami-growth',
    name: 'Tsunami Growth',
    setupPriceCents: 399_700,
    monthlyPriceCents: null,
    effectiveDate: '2026-09-13',
    approvalSource: 'Live site',
    notes: 'Strategy plus deeper implementation for businesses that need multiple AI systems working together across the customer journey. Strategy call is the next step.',
  },
] satisfies readonly ProductCatalogEntry[]);

const RECOMMENDATIONS: Record<ProblemCategory, { productId: ProductId; rationale: string }> = {
  visibility: {
    productId: 'aeo-wave-audit',
    rationale: 'The AEO Wave Audit is the best diagnostic next step when the primary constraint is being understood, trusted, cited, and recommended by AI search systems.',
  },
  opportunity: {
    productId: 'wave-starter',
    rationale: 'Wave Starter fits when the business has one clear AI opportunity and needs a focused implementation sprint.',
  },
  'follow-up': {
    productId: 'wave-starter',
    rationale: 'Wave Starter fits a focused lead-capture or follow-up implementation when that is the clearest business bottleneck.',
  },
  content: {
    productId: 'wave-builder',
    rationale: 'Wave Builder fits when content needs to connect with visibility, lead flow, and a larger growth system.',
  },
  support: {
    productId: 'wave-builder',
    rationale: 'Wave Builder fits when customer support automation needs to connect with other business workflows.',
  },
  workflow: {
    productId: 'wave-builder',
    rationale: 'Wave Builder fits when multiple workflows, follow-up steps, or tools need to be connected into one practical system.',
  },
  transformation: {
    productId: 'tsunami-growth',
    rationale: 'Tsunami Growth fits coordinated strategy and deeper multi-system AI implementation across the customer journey.',
  },
};

export function validateCatalog(catalog: readonly ProductCatalogEntry[] = PRODUCT_CATALOG): true {
  const seen = new Set<ProductId>();

  for (const entry of catalog) {
    if (seen.has(entry.id)) throw new Error(`Duplicate product id: ${entry.id}`);
    seen.add(entry.id);

    if (!Number.isInteger(entry.setupPriceCents) || entry.setupPriceCents < 0) {
      throw new Error(`Invalid setup price for ${entry.id}`);
    }
    if (
      entry.monthlyPriceCents !== null &&
      (!Number.isInteger(entry.monthlyPriceCents) || entry.monthlyPriceCents < 0)
    ) {
      throw new Error(`Invalid monthly price for ${entry.id}`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.effectiveDate)) {
      throw new Error(`Missing or invalid effective date for ${entry.id}`);
    }
    if (!entry.approvalSource.trim()) {
      throw new Error(`Missing approval attribution for ${entry.id}`);
    }
  }

  if (catalog.length !== 5) throw new Error(`Expected 5 approved launch offers, found ${catalog.length}`);
  return true;
}

export function getProduct(productId: ProductId): ProductCatalogEntry {
  const product = PRODUCT_CATALOG.find((entry) => entry.id === productId);
  if (!product) throw new Error(`Unknown product: ${productId}`);
  return product;
}

export function recommendProduct(problemCategory: ProblemCategory | string | null | undefined) {
  if (!problemCategory || !(problemCategory in RECOMMENDATIONS)) return null;
  return RECOMMENDATIONS[problemCategory as ProblemCategory];
}
