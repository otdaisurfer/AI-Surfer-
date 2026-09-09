import "./SitesLanding.css";
import homepageConcept from "../../assets/images/new-landing-hero.png";
import oceanAiYacht from "../../assets/images/ocean_ai_yacht.png";

const LIVE_SITE = "https://otdaisurfer.surf";

const revenueFunnel = ["LAND", "CAPTURE", "AUDIT", "RESULTS", "SELL", "IMPLEMENT", "RETAIN"];

const products = [
  {
    stage: "Discover",
    name: "AEO Wave Audit™",
    category: "AI Visibility & Discovery",
    image: "/packages/aeo-wave-audit.jpg",
    description:
      "Find the visibility gaps that keep AI systems from understanding, trusting, citing, and recommending your business.",
    cta: "Run the Wave Audit",
    href: "/wave-check",
    featured: true,
  },
  {
    stage: "Diagnose",
    name: "AI Opportunity Report™",
    category: "Business AI Strategy",
    image: "/packages/ai-opportunity-report.jpg",
    description:
      "Turn scattered AI possibilities into a prioritized list of the opportunities most likely to create measurable business value.",
    cta: "Explore Opportunities",
    href: "/members/products/ai-opportunity-report",
  },
  {
    stage: "Plan",
    name: "AEO Blueprint™",
    category: "AI Search Strategy",
    image: "/packages/aeo-blueprint.jpg",
    description:
      "Build a practical roadmap for becoming more visible, understandable, and authoritative across AI-powered answer engines.",
    cta: "Build the Blueprint",
    href: "/members/products/aeo-blueprint",
  },
  {
    stage: "Plan",
    name: "Automation Blueprint™",
    category: "AI Workflow Strategy",
    image: "/packages/automation-blueprint.jpg",
    description:
      "Map repetitive work into AI-powered workflows that reduce manual effort, connect your tools, and make operations more scalable.",
    cta: "Map Your Workflows",
    href: "/members/products/automation-blueprint",
  },
  {
    stage: "Implement",
    name: "Wave Scout™",
    category: "Lead Generation AI",
    image: "/packages/wave-scout.jpg",
    description:
      "Identify prospects, research buying signals, and organize opportunities so your team spends less time hunting and more time closing.",
    cta: "Ride with Wave Scout",
    href: "/members/products/wave-scout",
  },
  {
    stage: "Implement",
    name: "Sales Rider™",
    category: "AI Sales Assistant",
    image: "/packages/sales-rider.jpg",
    video: "/images/sales-rider-sparkle-animated.mp4",
    description:
      "Turn leads into conversations and conversations into opportunities with an always-on sales assistant.",
    cta: "Meet Sales Rider",
    href: "/members/products/sales-rider",
  },
  {
    stage: "Implement",
    name: "Content Creator™",
    category: "AI Marketing Engine",
    image: "/packages/content-creator.jpg",
    description:
      "Generate strategic social posts, emails, blogs, campaigns, offers, and marketing assets while keeping your message aligned.",
    cta: "Create with Content Creator",
    href: "/members/products/content-creator",
  },
  {
    stage: "Implement",
    name: "Automation Architect™",
    category: "AI Business Automation",
    image: "/packages/automation-architect.jpg",
    description:
      "Connect processes, tools, data, and AI agents to automate repetitive work and create a more scalable operation.",
    cta: "Automate the Work",
    href: "/members/products/automation-architect",
  },
  {
    stage: "Transform",
    name: "Big Kahuna™",
    category: "AI Growth Architect",
    image: "/packages/big-kahuna.jpg",
    video: "/images/big-kahuna-strategy-sparkle-animated.mp4",
    description:
      "Bring strategy, visibility, automation, agents, workflows, and growth opportunities together into one complete AI transformation experience.",
    cta: "Go Big Kahuna",
    href: "/members/products/big-kahuna",
    featured: true,
  },
];

export default function SitesLanding() {
  return (
    <main className="sites-landing">
      <style>{`
        @keyframes landingWaveFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes landingImageDrift {
          0%, 100% { transform: scale(1.01) translate3d(0, 0, 0); }
          50% { transform: scale(1.045) translate3d(0, -8px, 0); }
        }
        .visual-showcase-card, .product-card { animation: landingWaveFloat 7s ease-in-out infinite; }
        .visual-showcase-image, .product-card-image {
          animation: landingImageDrift 9s ease-in-out infinite;
          transition: transform .65s ease, filter .65s ease;
          will-change: transform;
        }
        .visual-showcase-card:hover .visual-showcase-image,
        .product-card:hover .product-card-image {
          transform: scale(1.075);
          filter: saturate(1.12) brightness(1.04);
        }
        @media (prefers-reduced-motion: reduce) {
          .visual-showcase-card, .product-card,
          .visual-showcase-image, .product-card-image {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div className="announcement">
        <span>🌺 Launch wave</span>
        <strong>20% off recurring app access and major software console plans</strong>
        <a href={`${LIVE_SITE}/pricing`}>See plans →</a>
      </div>

      <nav className="nav-shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Ocean Tide Drop AI SURFER home">
          <span className="brand-mark">OTD</span>
          <span>
            <strong>Ocean Tide Drop</strong>
            <small>AI SURFER</small>
          </span>
        </a>
        <div className="nav-links">
          <a href="#product-wave">Products</a>
          <a href={`${LIVE_SITE}/wave-check`}>Free Wave Check</a>
          <a className="nav-button" href="/members">Members</a>
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-glow hero-glow-pink" />
        <div className="hero-copy">
          <p className="eyebrow">AI THAT MOVES YOUR BUSINESS FORWARD</p>
          <h1>
            Ride the Wave.
            <span> Grow with AI.</span>
          </h1>
          <p className="hero-lead">
            High-powered AI tools, custom automation, and specialized software
            consoles built to help small businesses save time, get found, and grow.
          </p>
          <div className="hero-actions">
            <a className="button button-primary" href={`${LIVE_SITE}/wave-check`}>
              Get My Free AI Wave Check™
            </a>
            <a className="button button-secondary" href="#product-wave">
              Explore the Product Wave
            </a>
          </div>
          <div className="trust-line">
            <span>✓ Built for real businesses</span>
            <span>✓ Clear next steps</span>
            <span>✓ Human-first AI</span>
          </div>
        </div>

        <div className="logo-stage" aria-label="Ocean Tide Drop AI SURFER brand artwork">
          <div className="logo-frame">
            <img
              src="/ai-surfer-logo.jpg"
              alt="Ocean Tide Drop AI SURFER logo with waves, dolphins, sunrise, and surfboard"
            />
          </div>
          <div className="logo-caption">
            <span className="pulse" />
            <div>
              <strong>The next wave is already here.</strong>
              <small>Let&apos;s make it work for your business.</small>
            </div>
          </div>
        </div>
      </section>

      <section
        aria-label="AI Surfer visual showcase"
        style={{ maxWidth: 1184, margin: "0 auto 110px", padding: "0 28px" }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 24,
            alignItems: "stretch",
          }}
        >
          <figure
            className="visual-showcase-card"
            style={{
              margin: 0,
              overflow: "hidden",
              borderRadius: 30,
              border: "1px solid rgba(24,238,241,.32)",
              background: "linear-gradient(145deg, rgba(10,31,51,.96), rgba(6,13,25,.98))",
              boxShadow: "0 28px 75px rgba(0,0,0,.35)",
            }}
          >
            <img
              className="visual-showcase-image"
              src={homepageConcept}
              alt="Ocean Tide Drop AI Surfer homepage concept artwork"
              loading="eager"
              style={{ display: "block", width: "100%", height: "100%", minHeight: 360, objectFit: "cover" }}
            />
          </figure>

          <figure
            className="visual-showcase-card"
            style={{
              margin: 0,
              overflow: "hidden",
              borderRadius: 30,
              border: "1px solid rgba(255,60,185,.34)",
              background: "linear-gradient(145deg, rgba(10,31,51,.96), rgba(6,13,25,.98))",
              boxShadow: "0 28px 75px rgba(0,0,0,.35)",
            }}
          >
            <img
              className="visual-showcase-image"
              src={oceanAiYacht}
              alt="Ocean AI yacht artwork for Ocean Tide Drop AI Surfer"
              loading="lazy"
              style={{ display: "block", width: "100%", height: "100%", minHeight: 360, objectFit: "cover" }}
            />
          </figure>
        </div>
      </section>

      <section className="revenue-funnel" aria-label="AI Surfer revenue funnel">
        <p className="eyebrow">YOUR COMPLETE AI SALES MACHINE</p>
        <div className="revenue-funnel-track">
          {revenueFunnel.map((stage, index) => (
            <div className="revenue-funnel-step" key={stage}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{stage}</strong>
            </div>
          ))}
        </div>
        <p className="revenue-funnel-caption">
          Attract the right visitor, turn interest into action, and keep the relationship growing.
        </p>
      </section>

      <section className="wave-check" aria-labelledby="wave-check-title">
        <div>
          <p className="eyebrow">FREE AI VISIBILITY CHECK</p>
          <h2 id="wave-check-title">Can AI find and recommend your business?</h2>
          <p>
            Get a fast read on the visibility gaps that may keep AI systems from
            understanding, trusting, citing, and recommending you.
          </p>
        </div>
        <a className="button button-primary" href={`${LIVE_SITE}/wave-check`}>
          Start My Free Wave Check →
        </a>
      </section>

      <section className="product-section" id="product-wave" aria-labelledby="products-title">
        <div className="section-heading">
          <p className="eyebrow">THE AI SURFER PRODUCT WAVE</p>
          <h2 id="products-title">From first signal to full AI transformation.</h2>
          <p>
            Start where your business is. Then ride the next wave when you&apos;re ready.
            Every product solves a specific problem while connecting into one larger
            AI growth system.
          </p>
        </div>

        <figure
          className="visual-showcase-card"
          style={{
            margin: "0 0 34px",
            overflow: "hidden",
            borderRadius: 30,
            border: "1px solid rgba(24,238,241,.32)",
            background: "linear-gradient(145deg, rgba(10,31,51,.96), rgba(6,13,25,.98))",
            boxShadow: "0 28px 75px rgba(0,0,0,.35)",
          }}
        >
          <video
            className="visual-showcase-image"
            src="/images/product-ladder-sparkle-animated.mp4"
            aria-label="AI Surfer product ladder"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={{ display: "block", width: "100%", objectFit: "cover" }}
          />
        </figure>

        <div className="product-grid">
          {products.map((product, index) => (
            <article
              className={`product-card ${product.featured ? "product-card-featured" : ""}`}
              key={product.name}
              style={{ overflow: "hidden", padding: 0, animationDelay: `${index * 0.35}s` }}
            >
              {product.video ? (
                <video
                  className="product-card-image"
                  src={product.video}
                  aria-label={`${product.name} Ocean Tide Drop AI Surfer artwork`}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    objectPosition: "center top",
                    borderBottom: "1px solid rgba(111,147,178,.22)",
                  }}
                />
              ) : (
                <img
                  className="product-card-image"
                  src={product.image}
                  alt={`${product.name} Ocean Tide Drop AI Surfer artwork`}
                  loading="lazy"
                  style={{
                    display: "block",
                    width: "100%",
                    aspectRatio: "4 / 3",
                    objectFit: "cover",
                    objectPosition: "center top",
                    borderBottom: "1px solid rgba(111,147,178,.22)",
                  }}
                />
              )}
              <div style={{ display: "flex", flexDirection: "column", flex: 1, padding: 25 }}>
                <div className="product-topline">
                  <span className={`stage stage-${product.stage.toLowerCase()}`}>
                    {product.stage}
                  </span>
                  <span className="product-number">{String(index + 1).padStart(2, "0")}</span>
                </div>
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <a className="product-card-cta button button-primary" href={`${LIVE_SITE}${product.href}`} style={{ marginTop: "auto", width: "100%" }}>
                  {product.cta} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="membership">
        <div className="membership-copy">
          <p className="eyebrow">YOUR AI COMMAND CENTER</p>
          <h2>Build smarter. Move faster. Keep riding.</h2>
          <p>
            Explore your AI Surfer products, launch your Wave Audit, and turn business
            challenges into clear, revenue-ready next steps.
          </p>
        </div>
        <div className="membership-actions">
          <a className="button button-primary" href="/members">
            Enter the Members Area
          </a>
          <a className="text-link" href={`${LIVE_SITE}/pricing`}>
            View membership options →
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <img src="/ai-surfer-logo.jpg" alt="" />
          <div>
            <strong>Ocean Tide Drop AI SURFER</strong>
            <span>Ride the Wave 🌊 Grow with AI.</span>
          </div>
        </div>
        <div className="footer-links">
          <a href={`${LIVE_SITE}/wave-check`}>Free Wave Check</a>
          <a href={`${LIVE_SITE}/pricing`}>Pricing</a>
          <a href="/members">Members</a>
          <a href={LIVE_SITE}>Full Website</a>
          <a href="tel:8438704590">Call/Text (843) 870-4590</a>
        </div>
        <p>© 2026 Ocean Tide Drop AI SURFER. Built for the next wave.</p>
      </footer>
    </main>
  );
}
