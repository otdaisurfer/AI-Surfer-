export const PRODUCT_VISUALS = [
  {
    "slug": "free-ai-wave-check",
    "name": "Free AI Wave Check",
    "description": "Find your next AI opportunity.",
    "href": "/wave-check"
  },
  {
    "slug": "lead-leak-finder",
    "name": "Lead Leak Finder",
    "description": "Find where leads slip away.",
    "href": "/#lead-leak-finder"
  },
  {
    "slug": "ai-wave-audit",
    "name": "AI Wave Audit",
    "description": "Assess your business opportunities.",
    "href": "/wave-audit"
  },
  {
    "slug": "aeo-geo-wave-audit",
    "name": "AEO + GEO Wave Audit",
    "description": "Discover your AI visibility gaps.",
    "href": "/members/pricing"
  },
  {
    "slug": "ai-opportunity-report",
    "name": "AI Opportunity Report",
    "description": "Prioritize the opportunities worth pursuing.",
    "href": "/members/products/ai-opportunity-report"
  },
  {
    "slug": "aeo-blueprint",
    "name": "AEO Blueprint",
    "description": "Plan your AI discoverability roadmap.",
    "href": "/members/products/aeo-blueprint"
  },
  {
    "slug": "automation-blueprint",
    "name": "Automation Blueprint",
    "description": "Map your automation roadmap.",
    "href": "/members/products/automation-blueprint"
  },
  {
    "slug": "wave-scout",
    "name": "Wave Scout",
    "description": "Find opportunities and qualified leads.",
    "href": "/members/products/wave-scout"
  },
  {
    "slug": "sales-rider",
    "name": "Sales Rider",
    "description": "Turn inquiries into sales conversations.",
    "href": "/members/products/sales-rider"
  },
  {
    "slug": "content-creator",
    "name": "Content Creator",
    "description": "Create content that moves business forward.",
    "href": "/members/products/content-creator"
  },
  {
    "slug": "customer-care-cove",
    "name": "Customer Care Cove",
    "description": "Deliver helpful customer support.",
    "href": "/members/products/customer-care-cove"
  },
  {
    "slug": "automation-architect",
    "name": "Automation Architect",
    "description": "Connect your business workflows.",
    "href": "/members/products/automation-architect"
  },
  {
    "slug": "prompt-architect",
    "name": "Prompt Architect",
    "description": "Build clearer, more useful AI prompts.",
    "href": "/members/prompt-architect"
  },
  {
    "slug": "big-kahuna",
    "name": "Big Kahuna",
    "description": "Shape your AI strategy and growth roadmap.",
    "href": "/members/products/big-kahuna"
  }
] as const;

export function findProductVisual(slug: string) {
  const aliases: Record<string, string> = { "aeo-wave-audit": "aeo-geo-wave-audit", "ai-lead-leak-finder": "lead-leak-finder" };
  return PRODUCT_VISUALS.find(product => product.slug === (aliases[slug] ?? slug));
}
