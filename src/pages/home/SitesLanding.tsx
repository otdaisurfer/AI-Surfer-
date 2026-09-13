import "./SitesLanding.css";

const revenueFunnel = ["LAND", "CAPTURE", "AUDIT", "RESULTS", "SELL", "IMPLEMENT", "RETAIN"];

const approvedMediaStyle = {
  display: "block",
  width: "100%",
  aspectRatio: "4 / 5",
  objectFit: "contain",
  maxHeight: 560,
} as const;

const products = [
  {
    stage: "Discover",
    name: "AEO Wave Audit™",
    category: "AI Visibility & Discovery",
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
    description:
      "Turn scattered AI possibilities into a prioritized list of the opportunities most likely to create measurable business value.",
    cta: "Explore Opportunities",
    href: "/members/products/ai-opportunity-report",
  },
  {
    stage: "Plan",
    name: "AEO Blueprint™",
    category: "AI Search Strategy",
    description:
      "Build a practical roadmap for becoming more visible, understandable, and authoritative across AI-powered answer engines.",
    cta: "Build the Blueprint",
    href: "/members/products/aeo-blueprint",
  },
  {
    stage: "Plan",
    name: "Automation Blueprint™",
    category: "AI Workflow Strategy",
    description:
      "Map repetitive work into AI-powered workflows that reduce manual effort, connect your tools, and make operations more scalable.",
    cta: "Map Your Workflows",
    href: "/members/products/automation-blueprint",
  },
  {
    stage: "Implement",
    name: "Wave Scout™",
    category: "Lead Generation AI",
    description:
      "Identify prospects, research buying signals, and organize opportunities so your team spends less time hunting and more time closing.",
    cta: "Ride with Wave Scout",
    href: "/members/products/wave-scout",
  },
  {
    stage: "Implement",
    name: "Sales Rider™",
    category: "AI Sales Assistant",
    description:
      "Turn leads into conversations and conversations into opportunities with an always-on sales assistant.",
    cta: "Meet Sales Rider",
    href: "/members/products/sales-rider",
  },
  {
    stage: "Implement",
    name: "Content Creator™",
    category: "AI Marketing Engine",
    description:
      "Generate strategic social posts, emails, blogs, campaigns, offers, and marketing assets while keeping your message aligned.",
    cta: "Create with Content Creator",
    href: "/members/products/content-creator",
  },
  {
    stage: "Implement",
    name: "Automation Architect™",
    category: "AI Business Automation",
    description:
      "Connect processes, tools, data, and AI agents to automate repetitive work and create a more scalable operation.",
    cta: "Automate the Work",
    href: "/members/products/automation-architect",
  },
  {
    stage: "Transform",
    name: "Big Kahuna™",
    category: "AI Growth Architect",
    video: "/images/approved-landing/big-kahuna-animated.mp4",
    poster: "/images/approved-landing/big-kahuna-visibility.png",
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
        .product-card { animation: landingWaveFloat 7s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .product-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div className="announcement">
        <span>🌺 Launch wave</span>
        <strong>20% off recurring app access and major software console plans</strong>
        <a href="/pricing">See plans →</a>
      </div>

      <nav className="nav-shell" aria-label="Main navigation">
        <a className="brand" href="#top" aria-label="Ocean Tide Drop AI SURFER home">
          <img
            className="brand-mark"
            src="/ocean_tide_logo.png"
            alt=""
            aria-hidden="true"
            data-homepage-logo="true"
          />
          <span>
            <strong>Ocean Tide Drop</strong>
            <small>AI SURFER</small>
          </span>
        </a>
        <div className="nav-links">
          <a href="#product-wave">Products</a>
          <a href="/wave-check">Free Wave Check</a>
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
            <a
              className="button button-primary"
              href="/wave-check"
              data-funnel-cta="hero-wave-check"
            >
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

        <figure className="approved-media-card hero-media-card">
          <img
            className="approved-landing-image"
            src="/images/approved-landing/product-ladder.png"
            alt="Ocean Tide Drop AI SURFER product ladder from the AEO Wave Audit through Big Kahuna"
            decoding="async"
            style={approvedMediaStyle}
          />
          <figcaption>Start with insight. Build, automate, and grow with the right wave.</figcaption>
        </figure>
      </section>

      <section className="wave-check-steps" aria-labelledby="wave-check-steps-title">
        <div className="section-heading">
          <p className="eyebrow">START WITH THE RIGHT WAVE</p>
          <h2 id="wave-check-steps-title">How the Wave Check works</h2>
          <p>
            Get a practical read on where AI can create the most value in your business
            before you spend money building the wrong thing.
          </p>
        </div>
        <div className="wave-check-step-grid">
          <article className="wave-check-step-card">
            <span>01</span>
            <h3>Check the business signals</h3>
            <p>
              We look at visibility, repetitive work, lead follow-up, customer support,
              and automation opportunities.
            </p>
          </article>
          <article className="wave-check-step-card">
            <span>02</span>
            <h3>See your strongest AI opportunity</h3>
            <p>
              Your result highlights the gap or workflow where AI can make the clearest
              business impact.
            </p>
          </article>
          <article className="wave-check-step-card">
            <span>03</span>
            <h3>Get a clear next step</h3>
            <p>
              We connect the result to the AI SURFER product, service, or implementation
              path that fits the opportunity.
            </p>
          </article>
        </div>
      </section>

      <section className="approved-showcase" aria-labelledby="approved-showcase-title">
        <div className="section-heading">
          <p className="eyebrow">SEE THE AI SURFER SYSTEM</p>
          <h2 id="approved-showcase-title">Practical AI support for visibility, customers, and growth.</h2>
        </div>
        <div className="approved-media-grid">
          <figure className="approved-media-card">
            <img
              className="approved-landing-image"
              src="/images/approved-landing/customer-care-cove.png"
              alt="Customer Care Cove showing faster answers, FAQ support, appointment triage, and owner escalation"
              loading="lazy"
              decoding="async"
              style={approvedMediaStyle}
            />
            <figcaption>Customer Care Cove keeps customer conversations flowing.</figcaption>
          </figure>

          <figure className="approved-media-card">
            <video
              className="approved-landing-video"
              src="/images/approved-landing/ai-visibility-animated.mp4"
              poster="/images/approved-landing/big-kahuna-visibility.png"
              aria-label="Animated AI visibility strategy artwork"
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              style={approvedMediaStyle}
            />
            <img
              className="approved-video-fallback"
              src="/images/approved-landing/big-kahuna-visibility.png"
              alt="Big Kahuna AI visibility strategy"
              loading="lazy"
              decoding="async"
              style={approvedMediaStyle}
            />
            <figcaption>Become easier for Google and AI answer engines to find and trust.</figcaption>
          </figure>

          <figure className="approved-media-card">
            <img
              className="approved-landing-image"
              src="/images/approved-landing/big-kahuna-visibility.png"
              alt="Big Kahuna strategy showing AEO, GEO, Google, ChatGPT, Gemini, and Perplexity visibility"
              loading="lazy"
              decoding="async"
              style={approvedMediaStyle}
            />
            <figcaption>Big Kahuna connects visibility, authority, automation, and growth.</figcaption>
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
          <p className="eyebrow">FREE AI VISIBILITY + OPPORTUNITY CHECK</p>
          <h2 id="wave-check-title">Can AI find your business and help it run smarter?</h2>
          <p>
            Get a fast read on visibility gaps and operational AI opportunities, then
            leave with practical next steps instead of generic AI advice.
          </p>
        </div>
        <a
          className="button button-primary"
          href="/wave-check"
          data-funnel-cta="midpage-wave-check"
        >
          Start My Free Wave Check →
        </a>
      </section>

      <section className="results-preview" aria-labelledby="results-preview-title">
        <div className="section-heading">
          <p className="eyebrow">KNOW WHAT TO DO NEXT</p>
          <h2 id="results-preview-title">Your Wave Check turns AI possibilities into a decision.</h2>
          <p>
            Instead of generic AI advice, the result points you toward the business
            opportunity worth acting on first.
          </p>
        </div>
        <div className="results-preview-grid">
          <article>
            <span>Strongest opportunity</span>
            <h3>Find the highest-value wave</h3>
            <p>
              See whether visibility, follow-up, support, content, or workflow automation
              deserves attention first.
            </p>
          </article>
          <article>
            <span>Business gap</span>
            <h3>Understand what is slowing growth</h3>
            <p>
              See the visibility or workflow gap behind the recommendation in plain
              business language.
            </p>
          </article>
          <article>
            <span>Recommended action</span>
            <h3>Move from diagnosis to action</h3>
            <p>
              Get a clear next step and the AI SURFER product or service that matches it.
            </p>
          </article>
        </div>
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

        <figure className="approved-media-card product-ladder-media-card">
          <video
            className="approved-landing-video"
            src="/images/approved-landing/product-ladder-animated.mp4"
            poster="/images/approved-landing/product-ladder.png"
            aria-label="Animated Ocean Tide Drop AI SURFER product ladder"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            style={approvedMediaStyle}
          />
          <img
            className="approved-video-fallback"
            src="/images/approved-landing/product-ladder.png"
            alt="Ocean Tide Drop AI SURFER product ladder"
            loading="lazy"
            decoding="async"
            style={approvedMediaStyle}
          />
          <figcaption>Ride from your first Wave Check to a connected AI growth system.</figcaption>
        </figure>

        <div className="product-grid">
          {products.map((product, index) => (
            <article
              className={`product-card ${product.featured ? "product-card-featured" : ""}`}
              key={product.name}
              style={{ overflow: "hidden", padding: 0, animationDelay: `${index * 0.35}s` }}
            >
              {product.video && product.poster ? (
                <div className="product-card-media">
                  <video
                    className="approved-landing-video"
                    src={product.video}
                    poster={product.poster}
                    aria-label={`${product.name} animated AI visibility strategy artwork`}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    style={approvedMediaStyle}
                  />
                  <img
                    className="approved-video-fallback"
                    src={product.poster}
                    alt={`${product.name} AI visibility strategy`}
                    loading="lazy"
                    decoding="async"
                    style={approvedMediaStyle}
                  />
                </div>
              ) : null}
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
                <a
                  className="product-card-cta button button-primary"
                  href={product.href}
                  data-funnel-cta="product"
                  style={{ marginTop: "auto", width: "100%" }}
                >
                  {product.cta} <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="implementation-path" aria-labelledby="implementation-path-title">
        <div>
          <p className="eyebrow">FROM RECOMMENDATION TO REAL WORK</p>
          <h2 id="implementation-path-title">Turn the recommendation into action.</h2>
          <p>
            AI SURFER can help move from diagnosis into practical setup with focused
            agents, automations, visibility work, and service packages built around the
            business problem you found first.
          </p>
        </div>
        <a className="button button-secondary" href="/pricing">
          See Implementation Options →
        </a>
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
          <a className="button button-primary" href="/members" data-funnel-cta="members">
            Enter the Members Area
          </a>
          <a className="text-link" href="/pricing">
            View membership options →
          </a>
        </div>
      </section>

      <footer>
        <div className="footer-brand">
          <div>
            <strong>Ocean Tide Drop AI SURFER</strong>
            <span>Ride the Wave 🌊 Grow with AI.</span>
          </div>
        </div>
        <div className="footer-links">
          <a href="/wave-check">Free Wave Check</a>
          <a href="/pricing">Pricing</a>
          <a href="/members">Members</a>
          <a href="/">Full Website</a>
          <a href="tel:8438704590">Call/Text (843) 870-4590</a>
        </div>
        <p>© 2026 Ocean Tide Drop AI SURFER. Built for the next wave.</p>
      </footer>
    </main>
  );
}
