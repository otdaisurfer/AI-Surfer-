import type { ProblemCategory, ProductCatalogEntry, ProductId } from './contracts';

export const PRODUCT_CATALOG = Object.freeze([
  {
    id: 'free-wave-check',
    name: 'Free AI Wave Check',
    setupPriceCents: 0,
    monthlyPriceCents: null,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Lead-in assessment; no promise of a complete paid audit.',
  },
  {
    id: 'aeo-wave-audit',
    name: 'AEO Wave Audit',
    setupPriceCents: 99_700,
    monthlyPriceCents: null,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'One-time audit.',
  },
  {
    id: 'wave-scout',
    name: 'Wave Scout',
    setupPriceCents: 199_700,
    monthlyPriceCents: 99_700,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Opportunity and lead intelligence.',
  },
  {
    id: 'sales-rider',
    name: 'Sales Rider',
    setupPriceCents: 299_700,
    monthlyPriceCents: 149_700,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Lead capture and follow-up system.',
  },
  {
    id: 'content-creator',
    name: 'Content Creator',
    setupPriceCents: 199_700,
    monthlyPriceCents: 149_700,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Managed content system.',
  },
  {
    id: 'customer-care-cove',
    name: 'Customer Care Cove',
    setupPriceCents: 299_700,
    monthlyPriceCents: 79_700,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Customer-support agent; usage fees may be additional.',
  },
  {
    id: 'automation-architect',
    name: 'Automation Architect',
    setupPriceCents: 499_700,
    monthlyPriceCents: 149_700,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Workflow automation design and implementation.',
  },
  {
    id: 'big-kahuna',
    name: 'Big Kahuna',
    setupPriceCents: 999_700,
    monthlyPriceCents: 399_700,
    effectiveDate: '2026-08-28',
    approvalSource: 'Shannon',
    notes: 'Strategy and comprehensive implementation.',
  },
] satisfies readonly ProductCatalogEntry[]);

const RECOMMENDATIONS: Record<ProblemCategory, { productId: ProductId; rationale: string }> = {
  visibility: {
    productId: 'aeo-wave-audit',
    rationale: 'The AEO Wave Audit is the best first step when the primary constraint is being understood, trusted, cited, and recommended by AI search systems.',
  },
  opportunity: {
    productId: 'wave-scout',
    rationale: 'Wave Scout is designed to uncover AI opportunities, visibility gaps, and qualified leads.',
  },
  'follow-up': {
    productId: 'sales-rider',
    rationale: 'Sales Rider fits when leads are being lost because capture, response, or follow-up is inconsistent.',
  },
  content: {
    productId: 'content-creator',
    rationale: 'Content Creator fits businesses that need a consistent managed content engine.',
  },
  support: {
    productId: 'customer-care-cove',
    rationale: 'Customer Care Cove fits businesses that need faster customer answers while reducing repetitive support work.',
  },
  workflow: {
    productId: 'automation-architect',
    rationale: 'Automation Architect fits when disconnected tools and repetitive workflows are the primary bottleneck.',
  },
  transformation: {
    productId: 'big-kahuna',
    rationale: 'Big Kahuna fits coordinated strategy and multi-system AI implementation across the business.',
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

  if (catalog.length !== 8) throw new Error(`Expected 8 approved offers, found ${catalog.length}`);
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
