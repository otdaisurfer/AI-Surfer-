import { describe, expect, it } from 'vitest';
import { PRODUCT_CATALOG, getProduct, recommendProduct, validateCatalog } from './catalog';

describe('AI Fin approved launch catalog', () => {
  it('contains the current five launch offers with exact prices', () => {
    expect(PRODUCT_CATALOG).toHaveLength(5);
    expect(getProduct('free-wave-check')).toMatchObject({ setupPriceCents: 0, monthlyPriceCents: null });
    expect(getProduct('aeo-wave-audit')).toMatchObject({ setupPriceCents: 9_700, monthlyPriceCents: null });
    expect(getProduct('wave-starter')).toMatchObject({ setupPriceCents: 49_700, monthlyPriceCents: null });
    expect(getProduct('wave-builder')).toMatchObject({ setupPriceCents: 199_700, monthlyPriceCents: null });
    expect(getProduct('tsunami-growth')).toMatchObject({ setupPriceCents: 399_700, monthlyPriceCents: null });
    expect(validateCatalog()).toBe(true);
  });

  it.each([
    ['visibility', 'aeo-wave-audit'],
    ['opportunity', 'wave-starter'],
    ['follow-up', 'wave-starter'],
    ['content', 'wave-builder'],
    ['support', 'wave-builder'],
    ['workflow', 'wave-builder'],
    ['transformation', 'tsunami-growth'],
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
