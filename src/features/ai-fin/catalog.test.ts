import { describe, expect, it } from 'vitest';
import { PRODUCT_CATALOG, getProduct, recommendProduct, validateCatalog } from './catalog';

describe('AI Fin approved catalog', () => {
  it('contains all eight approved offers with exact prices', () => {
    expect(PRODUCT_CATALOG).toHaveLength(8);
    expect(getProduct('free-wave-check')).toMatchObject({ setupPriceCents: 0, monthlyPriceCents: null });
    expect(getProduct('aeo-wave-audit')).toMatchObject({ setupPriceCents: 99_700, monthlyPriceCents: null });
    expect(getProduct('wave-scout')).toMatchObject({ setupPriceCents: 199_700, monthlyPriceCents: 99_700 });
    expect(getProduct('sales-rider')).toMatchObject({ setupPriceCents: 299_700, monthlyPriceCents: 149_700 });
    expect(getProduct('content-creator')).toMatchObject({ setupPriceCents: 199_700, monthlyPriceCents: 149_700 });
    expect(getProduct('customer-care-cove')).toMatchObject({ setupPriceCents: 299_700, monthlyPriceCents: 79_700 });
    expect(getProduct('automation-architect')).toMatchObject({ setupPriceCents: 499_700, monthlyPriceCents: 149_700 });
    expect(getProduct('big-kahuna')).toMatchObject({ setupPriceCents: 999_700, monthlyPriceCents: 399_700 });
    expect(validateCatalog()).toBe(true);
  });

  it.each([
    ['visibility', 'aeo-wave-audit'],
    ['opportunity', 'wave-scout'],
    ['follow-up', 'sales-rider'],
    ['content', 'content-creator'],
    ['support', 'customer-care-cove'],
    ['workflow', 'automation-architect'],
    ['transformation', 'big-kahuna'],
  ] as const)('maps %s to one primary product', (category, expectedProduct) => {
    expect(recommendProduct(category)?.productId).toBe(expectedProduct);
  });

  it('returns null when the category is unknown instead of guessing', () => {
    expect(recommendProduct('mixed')).toBeNull();
    expect(recommendProduct(null)).toBeNull();
  });

  it('rejects invalid catalogs', () => {
    const duplicate = [...PRODUCT_CATALOG, PRODUCT_CATALOG[0]];
    expect(() => validateCatalog(duplicate)).toThrow(/Duplicate product id/);
  });
});
