export type ServiceOffer = {
  slug: string;
  name: string;
  description: string;
  price: number;
  priceId: string;
  checkoutUrl: string;
  support: { price: number; priceId: string; checkoutUrl: string; scope: string; minutes?: number };
};

// Verified live Stripe USD prices and hosted payment links, October 7, 2026.
export const MEMBERSHIP = {
  name: "AI SURFER Membership",
  price: 17,
  priceId: "price_1TwQIREx9w41hLck2OvXcsCv",
  checkoutUrl: "https://buy.stripe.com/cNi00j5BFcFAcDg7RR4gg03",
};

export const SUPPORT_TERMS = "Support is optional and renews monthly until cancelled. Agree the support scope before subscribing; cancel before the next renewal. New builds, full repeat audits, major changes, and third-party subscriptions or usage are separate.";
export const SERVICE_OFFERS: ServiceOffer[] = [
  {
    "slug": "aeo-wave-audit",
    "name": "AEO Wave Audit",
    "description": "Personalized 100-point AEO analysis with six detailed AI visibility categories, top three visibility gaps, a 10-question Customer Question Map, Biggest Wave analysis, a 30-Day Wave Plan, and a personalized AI Surfer recommendation.",
    "price": 97,
    "priceId": "price_1UAChqEx9w41hLck5o31IgAl",
    "checkoutUrl": "https://buy.stripe.com/eVq4gzaVZ350cDg5JJ4gg0a",
    "support": {
      "price": 97,
      "priceId": "price_1UO6yMEx9w41hLckMR13jZfp",
      "scope": "One monthly review of agreed visibility priorities and progress, plus guidance on the next fix.",
      "minutes": 30,
      "checkoutUrl": "https://buy.stripe.com/28EfZh2ptbBw6eS6NN4gg0d"
    }
  },
  {
    "slug": "ai-lead-leak-finder",
    "name": "AI Lead Leak Finder",
    "description": "Identify gaps in website lead capture, responses, and follow-up, with recommendations on what to fix first.",
    "price": 197,
    "priceId": "price_1UO6TkEx9w41hLckH84cwbnn",
    "checkoutUrl": "https://buy.stripe.com/cNi4gz1lp9to46K2xx4gg0c",
    "support": {
      "price": 97,
      "priceId": "price_1UO6yNEx9w41hLck0urcJWgT",
      "scope": "One monthly review of lead capture and follow-up gaps using customer-provided information, plus next-step guidance.",
      "minutes": 30,
      "checkoutUrl": "https://buy.stripe.com/aFa5kD1lpeNI9r42xx4gg0e"
    }
  },
  {
    "slug": "ai-opportunity-report",
    "name": "AI Opportunity Report",
    "description": "A prioritized report of AI opportunities and recommended next steps for your business.",
    "price": 297,
    "priceId": "price_1UO6TlEx9w41hLckDls33hFv",
    "support": {
      "price": 97,
      "priceId": "price_1UO6yOEx9w41hLckFHfjub0B",
      "scope": "One monthly check-in to review opportunity priorities and update the action list.",
      "minutes": 30,
      "checkoutUrl": "https://buy.stripe.com/14AfZh2pt7lgcDgfkj4gg0g"
    },
    "checkoutUrl": "https://buy.stripe.com/14A4gz2pt0WSfPs1tt4gg0f"
  },
  {
    "slug": "aeo-blueprint",
    "name": "AEO Blueprint",
    "description": "Build a practical roadmap for visibility across AI-powered search and answer engines.",
    "price": 497,
    "priceId": "price_1UO6ToEx9w41hLckGj4opVU7",
    "support": {
      "price": 147,
      "priceId": "price_1UO6yQEx9w41hLckCL8VYf5D",
      "scope": "Monthly roadmap progress review and minor updates to existing recommendations.",
      "minutes": 60,
      "checkoutUrl": "https://buy.stripe.com/14A7sL5BF9to32G7RR4gg0i"
    },
    "checkoutUrl": "https://buy.stripe.com/cNiaEXaVZdJE46K2xx4gg0h"
  },
  {
    "slug": "automation-blueprint",
    "name": "Automation Blueprint",
    "description": "Map repetitive work into AI-powered workflows that reduce manual effort and connect your tools.",
    "price": 497,
    "priceId": "price_1UO6TmEx9w41hLckkRIMkkCw",
    "support": {
      "price": 147,
      "priceId": "price_1UO6yREx9w41hLckuKU6MIt4",
      "scope": "Monthly workflow roadmap review and minor updates to the existing blueprint; implementation is separate.",
      "minutes": 60,
      "checkoutUrl": "https://buy.stripe.com/28E14n6FJfRM46K6NN4gg0k"
    },
    "checkoutUrl": "https://buy.stripe.com/eVq00j0hlgVQcDgegf4gg0j"
  },
  {
    "slug": "wave-starter",
    "name": "Wave Starter",
    "description": "A focused AI implementation starter service for SMBs, including priority setup and a clear launch path.",
    "price": 497,
    "priceId": "price_1UFGCrEx9w41hLckoEbkez4J",
    "checkoutUrl": "https://buy.stripe.com/aFa8wP7JN3500Uy1tt4gg0b",
    "support": {
      "price": 197,
      "priceId": "price_1UO6ySEx9w41hLckhyKnaz9j",
      "scope": "Monthly health review, troubleshooting, and small updates to the workflow delivered in the starter engagement.",
      "minutes": 90,
      "checkoutUrl": "https://buy.stripe.com/7sYaEX1lp3500Uy7RR4gg0l"
    }
  },
  {
    "slug": "wave-scout",
    "name": "Wave Scout",
    "description": "A scoped lead discovery and qualification workflow setup for your business. This is a done-for-you service, separate from access to the Wave Scout member tool.",
    "price": 497,
    "priceId": "price_1UO6UUEx9w41hLckhLoEVxDk",
    "support": {
      "price": 197,
      "priceId": "price_1UO6UVEx9w41hLckqGUNSnUP",
      "scope": "Ongoing maintenance of the delivered setup; scope must be agreed before subscribing.",
      "checkoutUrl": "https://buy.stripe.com/dRm00je8bbBwfPs9ZZ4gg0n"
    },
    "checkoutUrl": "https://buy.stripe.com/14A7sL2pt4940Uy2xx4gg0m"
  },
  {
    "slug": "content-creator",
    "name": "Content Creator",
    "description": "Build an AI-powered content engine for consistent business growth.",
    "price": 797,
    "priceId": "price_1UO6TpEx9w41hLckT7ByJfGh",
    "support": {
      "price": 297,
      "priceId": "price_1UO6TqEx9w41hLckJpyf5l0a",
      "scope": "Ongoing maintenance of the delivered setup; scope must be agreed before subscribing.",
      "checkoutUrl": "https://buy.stripe.com/14A5kD7JN20W7iW4FF4gg0p"
    },
    "checkoutUrl": "https://buy.stripe.com/7sY28r8NR0WSgTw4FF4gg0o"
  },
  {
    "slug": "sales-rider",
    "name": "Sales Rider",
    "description": "Build an AI-assisted sales system for instant responses, lead follow-up, nurturing, and conversions.",
    "price": 1497,
    "priceId": "price_1UO6TrEx9w41hLckjvCIl3mx",
    "support": {
      "price": 297,
      "priceId": "price_1UO6TsEx9w41hLckaq0l0DRp",
      "scope": "Ongoing maintenance of the delivered setup; scope must be agreed before subscribing.",
      "checkoutUrl": "https://buy.stripe.com/4gMdR9c03eNIeLo1tt4gg0r"
    },
    "checkoutUrl": "https://buy.stripe.com/cNi7sL3tx20W0Uy4FF4gg0q"
  },
  {
    "slug": "customer-care-cove",
    "name": "Customer Care Cove",
    "description": "Automate helpful customer support while keeping the human touch.",
    "price": 1497,
    "priceId": "price_1UO6TtEx9w41hLckI3n0QrEj",
    "support": {
      "price": 297,
      "priceId": "price_1UO6TuEx9w41hLcknHVlItTb",
      "scope": "Ongoing maintenance of the delivered setup; scope must be agreed before subscribing.",
      "checkoutUrl": "https://buy.stripe.com/14AdR99RVaxs8n0c874gg0t"
    },
    "checkoutUrl": "https://buy.stripe.com/6oUcN5d476hc0Uy6NN4gg0s"
  },
  {
    "slug": "automation-architect",
    "name": "Automation Architect",
    "description": "Connect business workflows with automated lead routing, CRM integration, and follow-up.",
    "price": 1997,
    "priceId": "price_1UO6TvEx9w41hLckURZXTxuQ",
    "support": {
      "price": 297,
      "priceId": "price_1UO6TwEx9w41hLckNnFcyHD2",
      "scope": "Ongoing maintenance of the delivered setup; scope must be agreed before subscribing.",
      "checkoutUrl": "https://buy.stripe.com/cNibJ18NR4941YC5JJ4gg0v"
    },
    "checkoutUrl": "https://buy.stripe.com/7sY00j9RV20W7iW4FF4gg0u"
  },
  {
    "slug": "big-kahuna",
    "name": "Big Kahuna",
    "description": "A focused AI business strategy engagement to prioritize opportunities and deliver a practical growth roadmap. One-time strategy service; implementation and paid advertising are quoted separately.",
    "price": 997,
    "priceId": "price_1UO6UWEx9w41hLck6u1COjVt",
    "support": {
      "price": 297,
      "priceId": "price_1UO6yTEx9w41hLckLCBCyBq1",
      "scope": "Monthly strategy review, KPI discussion, and small updates to the existing growth roadmap; campaign execution is separate.",
      "minutes": 120,
      "checkoutUrl": "https://buy.stripe.com/4gMbJ12pt5d8dHk4FF4gg0x"
    },
    "checkoutUrl": "https://buy.stripe.com/bJecN53txdJE9r4egf4gg0w"
  }
];

export function getServiceOffer(slug?: string): ServiceOffer | undefined {
  return SERVICE_OFFERS.find((offer) => offer.slug === slug);
}

