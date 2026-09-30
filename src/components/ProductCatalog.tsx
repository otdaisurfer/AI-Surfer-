import React from 'react';

interface Product {
  stage: 'DISCOVER' | 'DIAGNOSE' | 'PLAN' | 'IMPLEMENT' | 'TRANSFORM';
  name: string;
  category: string;
  description: string;
  cta: string;
  href: string;
  image: string;
  badge: string;
  featured?: boolean;
}

const products: Product[] = [
  {
    stage: 'DISCOVER',
    name: 'AEO Wave Audit™',
    category: 'AI Visibility & Discovery',
    description: 'Find the visibility gaps that keep AI systems from understanding, trusting, citing, and recommending your business.',
    cta: 'Run the Wave Audit',
    href: '/wave-check',
    image: '/packages/aeo-wave-audit-ocean-tech.png',
    badge: '/product-icons/aeo-wave-audit.png',
    featured: true,
  },
  {
    stage: 'DIAGNOSE',
    name: 'AI Opportunity Report™',
    category: 'Business AI Strategy',
    description: 'Turn scattered AI possibilities into a prioritized list of the opportunities most likely to create measurable business value.',
    cta: 'Explore Opportunities',
    href: '/members/products/ai-opportunity-report',
    image: '/packages/ai-opportunity-report-ocean-tech.png',
    badge: '/product-icons/ai-opportunity-report.png',
  },
  {
    stage: 'PLAN',
    name: 'AEO Blueprint™',
    category: 'AI Search Strategy',
    description: 'Build a practical roadmap for becoming more visible, understandable, and authoritative across AI-powered search and answer engines.',
    cta: 'Build the Blueprint',
    href: '/members/products/aeo-blueprint',
    image: '/packages/aeo-blueprint-ocean-tech.png',
    badge: '/product-icons/aeo-blueprint.png',
  },
  {
    stage: 'PLAN',
    name: 'Automation Blueprint™',
    category: 'AI Workflow Strategy',
    description: 'Map repetitive work into AI-powered workflows that reduce manual effort, connect your tools, and make operations more scalable.',
    cta: 'Map Your Workflows',
    href: '/members/products/automation-blueprint',
    image: '/packages/automation-blueprint-ocean-tech.png',
    badge: '/product-icons/automation-blueprint.png',
  },
  {
    stage: 'IMPLEMENT',
    name: 'Wave Scout™',
    category: 'Lead Generation AI',
    description: 'Identify prospects, research buying signals, and organize opportunities so your sales team spends less time hunting and more time closing.',
    cta: 'Ride with Wave Scout',
    href: '/members/products/wave-scout',
    image: '/packages/wave-scout-ocean-tech.png',
    badge: '/product-icons/wave-scout.png',
  },
  {
    stage: 'IMPLEMENT',
    name: 'Sales Rider™',
    category: 'AI Sales Assistant',
    description: 'Turn leads into conversations and conversations into opportunities with an always-on sales assistant.',
    cta: 'Meet Sales Rider',
    href: '/members/products/sales-rider',
    image: '/packages/sales-rider-ocean-tech.png',
    badge: '/product-icons/sales-rider.png',
  },
  {
    stage: 'IMPLEMENT',
    name: 'Content Creator™',
    category: 'AI Marketing Engine',
    description: 'Generate strategic social posts, emails, blogs, campaigns, offers, and marketing assets while keeping your message aligned.',
    cta: 'Create with Content Creator',
    href: '/members/products/content-creator',
    image: '/packages/content-creator-ocean-tech.png',
    badge: '/product-icons/content-creator.png',
  },
  {
    stage: 'IMPLEMENT',
    name: 'Automation Architect™',
    category: 'AI Business Automation',
    description: 'Connect processes, tools, data, and AI agents to automate repetitive work and create a more scalable operation.',
    cta: 'Automate the Work',
    href: '/members/products/automation-architect',
    image: '/packages/automation-architect-ocean-tech.png',
    badge: '/product-icons/automation-architect.png',
  },
  {
    stage: 'TRANSFORM',
    name: 'Big Kahuna™',
    category: 'AI Growth Architect',
    description: 'Bring strategy, visibility, automation, agents, workflows, and growth opportunities together into one complete AI transformation experience.',
    cta: 'Go Big Kahuna',
    href: '/members/products/big-kahuna',
    image: '/packages/big-kahuna.jpg',
    badge: '/product-icons/big-kahuna.png',
    featured: true,
  },
];

const stageDescriptions: Record<Product['stage'], string> = {
  DISCOVER: 'See where you stand.',
  DIAGNOSE: 'Find what matters most.',
  PLAN: 'Build the roadmap.',
  IMPLEMENT: 'Put AI to work.',
  TRANSFORM: 'Redesign how you grow.',
};

function ProductCard({ product }: { product: Product }) {
  return (
    <article className={`product-card product-card--${product.stage.toLowerCase()}${product.featured ? ' product-card--featured' : ''}`}>
      <div className="product-card__image-wrap">
        <img
          src={product.image}
          alt={`${product.name} ${product.category}`}
          className="product-card__image"
          loading="lazy"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
            event.currentTarget.parentElement?.classList.add('product-card__image-wrap--fallback');
          }}
        />
        <span className="product-card__stage">{product.stage}</span>
        <img
          src={product.badge}
          alt={`${product.name} Ocean Crew level badge`}
          className="product-card__badge"
          loading="lazy"
        />
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-card__description">{product.description}</p>
        <a className="product-card__cta" href={product.href}>{product.cta} <span aria-hidden="true">→</span></a>
      </div>
    </article>
  );
}

export default function ProductCatalog() {
  const stages = Array.from(new Set(products.map((product) => product.stage)));

  return (
    <section className="product-catalog" id="ai-surfer-products" aria-labelledby="ai-surfer-products-title">
      <style>{`
        .product-catalog { margin: 0 auto; padding: 90px 20px 110px; max-width: 1200px; }
        .product-catalog__intro { max-width: 780px; margin: 0 auto 56px; text-align: center; }
        .product-catalog__eyebrow { margin: 0 0 12px; color: #67e8f9; font-size: .78rem; font-weight: 900; letter-spacing: .18em; }
        .product-catalog__intro h2 { margin: 0; font-size: clamp(2.1rem, 5vw, 4rem); line-height: 1.02; }
        .product-catalog__intro p { margin: 20px auto 0; max-width: 680px; color: #a8b7cc; font-size: 1.08rem; line-height: 1.7; }
        .product-catalog__wave { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 26px; }
        .product-catalog__wave span { padding: 8px 12px; border: 1px solid rgba(103,232,249,.24); border-radius: 999px; color: #cdebf4; background: rgba(255,255,255,.035); font-size: .74rem; font-weight: 800; letter-spacing: .08em; }
        .product-stage { margin-top: 54px; }
        .product-stage__heading { display: flex; align-items: end; justify-content: space-between; gap: 20px; margin-bottom: 18px; }
        .product-stage__heading h3 { margin: 0; font-size: 1.4rem; }
        .product-stage__heading p { margin: 0; color: #8fa4bd; font-size: .9rem; }
        .product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 22px; }
        .product-card { overflow: hidden; border: 1px solid rgba(103,232,249,.14); border-radius: 24px; background: linear-gradient(145deg, rgba(13,30,52,.98), rgba(6,15,28,.98)); box-shadow: 0 20px 60px rgba(0,0,0,.18); transition: transform .2s ease, border-color .2s ease; }
        .product-card:hover { transform: translateY(-4px); border-color: rgba(103,232,249,.42); }
        .product-card--featured { border-color: rgba(103,232,249,.35); }
        .product-card__image-wrap { position: relative; min-height: 270px; overflow: hidden; background: radial-gradient(circle at 50% 20%, rgba(44,166,208,.26), rgba(8,19,34,.98) 68%); }
        .product-card__image-wrap--fallback::after { content: 'AI SURFER'; position: absolute; inset: 0; display: grid; place-items: center; color: rgba(103,232,249,.55); font-size: 1.5rem; font-weight: 900; letter-spacing: .18em; }
        .product-card__image { width: 100%; height: 270px; display: block; object-fit: cover; }
        .product-card__stage { position: absolute; top: 14px; left: 14px; padding: 7px 10px; border-radius: 999px; color: #00131a; background: #a5f3fc; font-size: .68rem; font-weight: 950; letter-spacing: .1em; }
        .product-card__badge { position: absolute; top: 10px; right: 10px; z-index: 2; width: 104px; height: 104px; object-fit: contain; filter: drop-shadow(0 8px 14px rgba(0,0,0,.55)); transition: transform .2s ease; }
        .product-card:hover .product-card__badge { transform: translateY(-2px) scale(1.04); }
        .product-card__body { padding: 25px 26px 28px; }
        .product-card__category { margin: 0 0 8px; color: #67e8f9; font-size: .72rem; font-weight: 900; letter-spacing: .1em; text-transform: uppercase; }
        .product-card h3 { margin: 0; font-size: 1.65rem; }
        .product-card__description { min-height: 76px; margin: 12px 0 22px; color: #aebdd0; line-height: 1.62; }
        .product-card__cta { color: #e8fbff; font-weight: 900; text-decoration: none; }
        .product-card__cta:hover { color: #67e8f9; }
        @media (max-width: 760px) {
          .product-catalog { padding-top: 65px; }
          .product-grid { grid-template-columns: 1fr; }
          .product-stage__heading { align-items: start; flex-direction: column; }
          .product-card__image-wrap, .product-card__image { min-height: 220px; height: 220px; }
          .product-card__badge { width: 88px; height: 88px; }
        }
      `}</style>

      <div className="product-catalog__intro">
        <p className="product-catalog__eyebrow">THE AI SURFER PRODUCT WAVE</p>
        <h2 id="ai-surfer-products-title">From first signal to full AI transformation. 🌊</h2>
        <p>Start where your business is. Then ride the next wave when you're ready. Each product solves a specific problem while connecting into one larger AI growth system.</p>
        <div className="product-catalog__wave" aria-label="AI Surfer product journey">
          {stages.map((stage) => <span key={stage}>{stage}</span>)}
        </div>
      </div>

      {stages.map((stage) => {
        const stageProducts = products.filter((product) => product.stage === stage);
        return (
          <div className="product-stage" key={stage}>
            <div className="product-stage__heading">
              <h3>{stage}</h3>
              <p>{stageDescriptions[stage]}</p>
            </div>
            <div className="product-grid">
              {stageProducts.map((product) => <ProductCard key={product.name} product={product} />)}
            </div>
          </div>
        );
      })}
    </section>
  );
}
