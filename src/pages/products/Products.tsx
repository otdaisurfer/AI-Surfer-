import { Link } from "react-router-dom";
import { useEffect } from "react";
import WaveHandlerVisual from "../../components/WaveHandlerVisual";
import { SERVICE_OFFERS } from "../members/serviceOffers";

type FunnelEvent = {
  event: "products_view" | "offer_click" | "checkout_start" | "wave_check_start";
  offer?: string;
  price?: number;
};

function trackFunnelEvent(detail: FunnelEvent) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("ai-surfer:funnel", { detail }));

  const dataLayer = (window as Window & { dataLayer?: Array<Record<string, unknown>> }).dataLayer;
  dataLayer?.push(detail);
}

type ProductCard = {
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  href: string;
  external: boolean;
  cta: string;
};

const GROUP_RANGES: Record<string, string> = {
  "Free Entry": "$0",
  "Audits & Reports": "$97–$297",
  "Build & Grow": "$497–$997",
  "Systems & Scale": "$1,497–$1,997",
};

const PAID_SLUGS_BY_GROUP: Record<string, string[]> = {
  "Audits & Reports": ["aeo-wave-audit", "ai-lead-leak-finder", "ai-opportunity-report"],
  "Build & Grow": ["wave-scout", "aeo-blueprint", "content-creator", "big-kahuna"],
  "Systems & Scale": ["sales-rider", "customer-care-cove", "automation-architect"],
};

function formatPrice(price: number): string {
  return `$${price.toLocaleString("en-US")}`;
}

function paidProductCard(slug: string): ProductCard | null {
  const offer = SERVICE_OFFERS.find((item) => item.slug === slug);
  if (!offer) return null;
  return {
    name: offer.name,
    price: offer.price,
    priceLabel: formatPrice(offer.price),
    description: offer.description,
    href: offer.checkoutUrl,
    external: true,
    cta: `Buy ${offer.name}`,
  };
}

const FREE_PRODUCTS: ProductCard[] = [
  {
    name: "Business Starter Kit",
    price: 0,
    priceLabel: "Free",
    description: "A friendly first step into practical AI, prompts, simple automation, and momentum.",
    href: "/wave-check",
    external: false,
    cta: "Start the free AI Wave Check",
  },
  {
    name: "Free AI Wave Check",
    price: 0,
    priceLabel: "Free",
    description: "Discover your first AI opportunity before choosing a service.",
    href: "/wave-check",
    external: false,
    cta: "Start the free AI Wave Check",
  },
];

const GROUPS: { title: string; products: ProductCard[] }[] = [
  { title: "Free Entry", products: FREE_PRODUCTS },
  ...Object.entries(PAID_SLUGS_BY_GROUP).map(([title, slugs]) => ({
    title,
    products: slugs.map(paidProductCard).filter((card): card is ProductCard => card !== null),
  })),
];

export default function Products() {
  useEffect(() => {
    trackFunnelEvent({ event: "products_view" });
  }, []);

  const handleProductClick = (product: ProductCard) => {
    trackFunnelEvent({ event: "offer_click", offer: product.name, price: product.price });

    if (product.external) {
      trackFunnelEvent({ event: "checkout_start", offer: product.name, price: product.price });
    } else {
      trackFunnelEvent({ event: "wave_check_start", offer: product.name, price: product.price });
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-16 text-white">
      <section className="mx-auto max-w-6xl">
        <div className="text-center">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-cyan-300">Ocean Tide Drop AI SURFER</p>
          <h1 className="mt-3 text-5xl font-black md:text-6xl">AI Surfer Products</h1>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            All 12 AI Surfer products in one place. Every paid product checks out securely with Stripe.
          </p>
        </div>

        <WaveHandlerVisual />

        {GROUPS.map((group) => (
          <section key={group.title} className="mt-12">
            <div className="mb-6 flex flex-col gap-1 md:flex-row md:items-end md:justify-between">
              <h2 className="text-3xl font-black">{group.title}</h2>
              <span className="text-sm font-bold text-cyan-300">{GROUP_RANGES[group.title]}</span>
            </div>
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {group.products.map((product) => (
                <article key={product.name} className="flex flex-col rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <h3 className="text-2xl font-black">{product.name}</h3>
                  <div className="mt-3 text-4xl font-black text-cyan-300">{product.priceLabel}</div>
                  <p className="mt-4 flex-grow leading-7 text-slate-300">{product.description}</p>
                  {product.external ? (
                    <a
                      href={product.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => handleProductClick(product)}
                      className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950"
                    >
                      {product.cta}
                    </a>
                  ) : (
                    <Link
                      to={product.href}
                      onClick={() => handleProductClick(product)}
                      className="mt-7 inline-flex rounded-full bg-cyan-300 px-6 py-3 font-black text-slate-950"
                    >
                      {product.cta}
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </section>
        ))}

        <div className="mx-auto mt-12 max-w-3xl rounded-3xl border border-white/10 bg-white/[0.04] p-7 text-slate-300">
          <h2 className="text-2xl font-black text-white">Not sure which wave fits?</h2>
          <p className="mt-3 leading-7">Use the free AI Wave Check first, then choose the smallest product that solves the clearest business problem.</p>
          <Link
            to="/wave-check"
            onClick={() => trackFunnelEvent({ event: "wave_check_start" })}
            className="mt-5 inline-flex font-black text-cyan-300"
          >
            Start the free AI Wave Check →
          </Link>
        </div>
      </section>
    </main>
  );
}
