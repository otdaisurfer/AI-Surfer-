import { FormEvent, useEffect, useRef, useState } from "react";
import "./SitesLanding.css";

const revenueFunnel = ["LAND", "CAPTURE", "AUDIT", "RESULTS", "SELL", "IMPLEMENT", "RETAIN"];

const customerJourney = [
  { stage: "DISCOVER", icon: "/icons/ai-surfer/discover.webp" },
  { stage: "DIAGNOSE", icon: "/icons/ai-surfer/diagnose.webp" },
  { stage: "PLAN", icon: "/icons/ai-surfer/plan.webp" },
  { stage: "IMPLEMENT", icon: "/icons/ai-surfer/implement.webp" },
  { stage: "TRANSFORM", icon: "/icons/ai-surfer/transform.webp" },
];

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
    name: "Free AI Wave Check™",
    category: "Business AI Opportunity Check",
    description:
      "Answer five quick questions to see your strongest AI opportunity, practical first move, and the implementation path that fits.",
    cta: "Start the Free Wave Check",
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
    icon: "/icons/ai-surfer/wave-scout.webp",
    category: "Lead Generation AI",
    description:
      "Identify prospects, research buying signals, and organize opportunities so your team spends less time hunting and more time closing.",
    cta: "Ride with Wave Scout",
    href: "/members/products/wave-scout",
  },
  {
    stage: "Implement",
    name: "Sales Rider™",
    icon: "/icons/ai-surfer/sales-rider.webp",
    category: "AI Sales Assistant",
    description:
      "Turn leads into conversations and conversations into opportunities with an always-on sales assistant.",
    cta: "Meet Sales Rider",
    href: "/members/products/sales-rider",
  },
  {
    stage: "Implement",
    name: "Content Creator™",
    icon: "/icons/ai-surfer/content-creator.webp",
    category: "AI Marketing Engine",
    description:
      "Generate strategic social posts, emails, blogs, campaigns, offers, and marketing assets while keeping your message aligned.",
    cta: "Create with Content Creator",
    href: "/members/products/content-creator",
  },
  {
    stage: "Implement",
    name: "Customer Care Cove™",
    icon: "/icons/ai-surfer/customer-care-cove.webp",
    category: "AI Customer Support",
    description:
      "Answer routine questions faster, guide customers to the right next step, and escalate important conversations to a real person.",
    cta: "Improve Customer Care",
    href: "/members/products/customer-care-cove",
  },
  {
    stage: "Implement",
    name: "Automation Architect™",
    icon: "/icons/ai-surfer/automation-architect.webp",
    category: "AI Business Automation",
    description:
      "Connect processes, tools, data, and AI agents to automate repetitive work and create a more scalable operation.",
    cta: "Automate the Work",
    href: "/members/products/automation-architect",
  },
  {
    stage: "Transform",
    name: "Big Kahuna™",
    icon: "/icons/ai-surfer/big-kahuna.webp",
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

function DeferredVideo({ src, poster, label }: { src: string; poster: string; label: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        video.src = src;
        void video.play().catch(() => undefined);
        observer.disconnect();
      },
      { rootMargin: "240px 0px" },
    );

    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={videoRef}
      className="approved-landing-video"
      data-src={src}
      poster={poster}
      aria-label={label}
      autoPlay
      muted
      loop
      playsInline
      preload="none"
      style={approvedMediaStyle}
    />
  );
}

export default function SitesLanding() {
  const [leadLeakOpen, setLeadLeakOpen] = useState(false);
  const [leadLeakComplete, setLeadLeakComplete] = useState(false);
  const [leadLeakAnswers, setLeadLeakAnswers] = useState({
    source: "",
    responseTime: "",
    owner: "",
    followUps: "",
    conversion: "",
  });

  const updateLeadLeakAnswer = (field: keyof typeof leadLeakAnswers, value: string) => {
    setLeadLeakAnswers((current) => ({ ...current, [field]: value }));
  };

  const handleLeadLeakSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sessionStorage.setItem("ai-surfer-lead-leak-answers", JSON.stringify(leadLeakAnswers));
    setLeadLeakComplete(true);
  };

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
        <span>🌊 Start here</span>
        <strong>The Free AI Wave Check is live</strong>
        <a href="/wave-check">Find my biggest AI opportunity →</a>
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

      <section className="wave-check-hero" id="top">
        <div className="wave-check-hero-glow wave-check-hero-glow-one" />
        <div className="wave-check-hero-glow wave-check-hero-glow-two" />
        <div className="wave-check-hero-inner">
          <p className="eyebrow">START HERE: FREE AI WAVE CHECK</p>
          <h1>
            Find your business&apos;s
            <span> biggest AI opportunity.</span>
          </h1>
          <p className="wave-check-hero-lead">
            Answer five quick questions and get a practical read on where AI can save time,
            capture more opportunities, improve visibility, or strengthen the way your
            business runs.
          </p>
          <a
            className="button button-primary wave-check-hero-cta"
            href="/wave-check"
            data-funnel-cta="hero-wave-check"
          >
            Start My Free AI Wave Check™
          </a>
          <a
            className="wave-check-hero-media-link"
            href="/wave-check"
            aria-label="Start the Free AI Wave Check"
            data-funnel-cta="hero-wave-check-image"
          >
            <figure className="wave-check-hero-media">
              <img
                className="wave-check-hero-image"
                src="/images/file_00000000f10481f9a3d2f23cc759e7c6.png"
                alt="Ocean Tide Drop AI SURFER Free AI Wave Check"
                fetchPriority="high"
                decoding="async"
              />
            </figure>
          </a>
          <p className="wave-check-hero-footnote">
            Free to start. Clear next step. No giant AI project required.
          </p>
        </div>
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

      <section className="lead-leak-finder" id="lead-leak-finder" aria-labelledby="lead-leak-title">
        <div className="lead-leak-visual">
          <img
            src="/images/lead-leak-finder.png"
            alt="AI Fin finding lost leads in a glowing ocean sales pipeline"
            loading="lazy"
            decoding="async"
          />
          <strong className="lead-leak-badge-title">LEAD LEAK FINDER</strong>
          <strong className="lead-leak-badge-url">OTDAISURFER.SURF</strong>
        </div>
        <div className="lead-leak-content">
          <p className="eyebrow">DIAGNOSE · CLIENT-READY SKILL</p>
          <h2 id="lead-leak-title">Lead Leak Finder</h2>
          <p className="lead-leak-question">
            How many potential customers are disappearing because follow-up is too slow—or never happens?
          </p>
          <p className="lead-leak-description">
            AI SURFER traces the path from first inquiry to sale, spots where prospects drift away,
            and identifies the first follow-up automation worth building.
          </p>
          {!leadLeakOpen && (
            <button className="button button-primary lead-leak-cta" type="button" onClick={() => setLeadLeakOpen(true)}>
              Find My Lead Leak →
            </button>
          )}
        </div>

        {leadLeakOpen && !leadLeakComplete && (
          <form className="lead-leak-form" onSubmit={handleLeadLeakSubmit}>
            <label>
              1. Where do most new leads come from?
              <input required value={leadLeakAnswers.source} onChange={(event) => updateLeadLeakAnswer("source", event.target.value)} placeholder="Website, phone, Facebook, referrals…" />
            </label>
            <label>
              2. How quickly do you usually respond?
              <select required value={leadLeakAnswers.responseTime} onChange={(event) => updateLeadLeakAnswer("responseTime", event.target.value)}>
                <option value="">Choose a response time</option>
                <option>Under 5 minutes</option>
                <option>Within 1 hour</option>
                <option>Same business day</option>
                <option>Next day or later</option>
                <option>It varies</option>
              </select>
            </label>
            <label>
              3. Who is responsible for following up?
              <input required value={leadLeakAnswers.owner} onChange={(event) => updateLeadLeakAnswer("owner", event.target.value)} placeholder="Owner, salesperson, office team…" />
            </label>
            <label>
              4. How many follow-ups happen before you stop?
              <select required value={leadLeakAnswers.followUps} onChange={(event) => updateLeadLeakAnswer("followUps", event.target.value)}>
                <option value="">Choose the closest answer</option>
                <option>None</option>
                <option>One</option>
                <option>Two or three</option>
                <option>Four or more</option>
                <option>No consistent process</option>
              </select>
            </label>
            <label>
              5. What counts as a successful conversion?
              <input required value={leadLeakAnswers.conversion} onChange={(event) => updateLeadLeakAnswer("conversion", event.target.value)} placeholder="Booked call, estimate, appointment, purchase…" />
            </label>
            <button className="button button-primary lead-leak-cta" type="submit">
              Show My First Lead Leak Read →
            </button>
          </form>
        )}

        {leadLeakComplete && (
          <div className="lead-leak-result" role="status">
            <span aria-hidden="true">🌊</span>
            <div>
              <h3>Your Lead Leak Map has started.</h3>
              <p>
                Your answers are saved for this visit. Continue to the free AI Wave Check to connect
                your response time, follow-up ownership, and conversion goal to the clearest automation opportunity.
              </p>
            </div>
            <a className="button button-primary" href="/wave-check">Continue to My AI Wave Check →</a>
          </div>
        )}

        <div className="lead-leak-journey" aria-label="AI Surfer customer journey">
          {customerJourney.map(({ stage, icon }) => (
            <span className={stage === "DIAGNOSE" ? "active" : ""} key={stage}>
              <img src={icon} alt="" aria-hidden="true" loading="lazy" />
              {stage}
            </span>
          ))}
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
              fetchPriority="low"
              decoding="async"
              style={approvedMediaStyle}
            />
            <figcaption>Customer Care Cove keeps customer conversations flowing.</figcaption>
          </figure>

          <figure className="approved-media-card">
            <DeferredVideo
              src="/images/approved-landing/ai-visibility-animated.mp4"
              poster="/images/approved-landing/big-kahuna-visibility.png"
              label="Animated AI visibility strategy artwork"
            />
            <figcaption>Become easier for Google and AI answer engines to find and trust.</figcaption>
          </figure>

          <figure className="approved-media-card">
            <img
              className="approved-landing-image"
              src="/images/approved-landing/big-kahuna-visibility.png"
              alt="Big Kahuna strategy showing AEO, GEO, Google, ChatGPT, Gemini, and Perplexity visibility"
              loading="lazy"
              fetchPriority="low"
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
          <DeferredVideo
            src="/images/approved-landing/product-ladder-animated.mp4"
            poster="/images/approved-landing/product-ladder.png"
            label="Animated Ocean Tide Drop AI SURFER product ladder"
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
                  <DeferredVideo
                    src={product.video}
                    poster={product.poster}
                    label={`${product.name} animated AI visibility strategy artwork`}
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
                {product.icon ? (
                  <img
                    className="product-agent-icon"
                    src={product.icon}
                    alt={`${product.name} icon`}
                    loading="lazy"
                    decoding="async"
                  />
                ) : null}
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
            Go to Pricing →
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
