// Exact IDs verified in the AI Surfer Shopify catalog. Free offers, the audit,
// and Lead Leak Finder do not map to a current paid member workspace.
export const SHOPIFY_STORE = 'nrctqw-pi.myshopify.com';
export const SHOPIFY_PRODUCT_TO_WORKSPACE: Readonly<Record<string, string>> = {
  '8045506789435': 'wave-scout',
  '8045509017659': 'sales-rider',
  '8045510688827': 'content-creator',
  '8045511278651': 'customer-care-cove',
  '8045512720443': 'automation-architect',
  '8045514096699': 'big-kahuna',
  '8045516947515': 'aeo-blueprint',
  '8045519372347': 'ai-opportunity-report',
};
export const SHOPIFY_WORKSPACE_NAMES: Readonly<Record<string, string>> = {
  'wave-scout': 'Wave Scout', 'sales-rider': 'Sales Rider',
  'content-creator': 'Content Creator', 'customer-care-cove': 'Customer Care Cove',
  'automation-architect': 'Automation Architect', 'big-kahuna': 'Big Kahuna',
  'aeo-blueprint': 'AEO Blueprint', 'ai-opportunity-report': 'AI Opportunity Report',
};
export function isShopifyWorkspace(value: unknown): value is string {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(SHOPIFY_WORKSPACE_NAMES, value);
}
export type ShopifyAccess = {
  product_slug: string;
  status: 'pending' | 'active' | 'expired' | 'revoked';
  activated_at: string | null;
  expires_at: string | null;
};
export function activeShopifyAccess(grants: ShopifyAccess[], slug: string, now = Date.now()) {
  return grants.find((grant) => grant.product_slug === slug && grant.status === 'active'
    && grant.expires_at && Date.parse(grant.expires_at) > now);
}
