import WaveHandlerVisual from "../../components/WaveHandlerVisual";
import { FormEvent, useState } from "react";
import "./SitesLanding.css";

const revenueFunnel = ["LAND", "CAPTURE", "AUDIT", "RESULTS", "SELL", "IMPLEMENT", "RETAIN"];

const customerJourney = [
  { stage: "DISCOVER", icon: "/icons/ai-surfer/discover.webp" },
  { stage: "DIAGNOSE", icon: "/icons/ai-surfer/diagnose.webp" },
  { stage: "PLAN", icon: "/icons/ai-surfer/plan.webp" },
  { stage: "IMPLEMENT", icon: "/icons/ai-surfer/implement.webp" },
  { stage: "TRANSFORM", icon: "/icons/ai-surfer/transform.webp" },
];

const leadLeakImage = "data:image/jpeg;base64,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";

const products = [
  {
    stage: "Discover",
    name: "Free AI Wave Check™",
    category: "Business AI Opportunity Check",
    description:
      "Answer five quick questions to see your strongest AI opportunity, practical first move, and the implementation path that fits.",
    cta: "Start the Free Wave Check",
    href: "/wave-check",
    image: "/images/approved-ai-fin-wave-check.jpg?v=20260928-1",
    featured: true,
  },
  {
    stage: "Diagnose",
    name: "Lead Leak Finder",
    category: "Lead Follow-Up Check",
    description:
      "See where leads are slipping away, organize the follow-up gaps, and identify the first automation worth fixing.",
    cta: "Open the Lead Leak Finder",
    href: "#lead-leak-finder",
    image: leadLeakImage,
    featured: true,
  },
];

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
        @media (prefers-reduced-motion: reduce) {
          .product-card {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <div className="announcement">
        <span>🌊 Start here</span>
        <strong>Free AI Wave Check + Lead Leak Finder</strong>
        <a href="#lead-leak-finder">Find where leads are slipping away →</a>
      </div>

      <a className="landing-logo-link" href="#top" aria-label="Ocean Tide Drop AI SURFER home">
        <img
          className="landing-logo"
          src="/ocean_tide_logo.png"
          alt=""
          aria-hidden="true"
          data-homepage-logo="true"
          fetchPriority="high"
          decoding="async"
        />
      </a>

      <nav className="nav-shell" aria-label="Main navigation">
        <div className="nav-links">
          <a href="#product-wave">Products</a>
          <a href="/wave-check">Free Wave Check</a>
          <a href="#lead-leak-finder">Lead Leak Finder</a>
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
          <div className="hero-actions">
            <a
              className="button button-primary wave-check-hero-cta"
              href="/wave-check"
              data-funnel-cta="hero-wave-check"
            >
              Start My Free AI Wave Check™
            </a>
            <a
              className="button button-secondary"
              href="#lead-leak-finder"
              data-funnel-cta="hero-lead-leak"
            >
              Find My Lead Leaks →
            </a>
          </div>
          <a
            className="wave-check-hero-media-link"
            href="/wave-check"
            aria-label="Start the Free AI Wave Check"
            data-funnel-cta="hero-wave-check-image"
          >
            <figure className="wave-check-hero-media">
              <img
                className="wave-check-hero-image"
                src="/images/wave-handler/wave-check.webp"
                srcSet="/images/wave-handler/wave-check-mobile.webp 768w, /images/wave-handler/wave-check.webp 1229w"
                sizes="(max-width: 820px) 88vw, 410px"
                width={1229}
                height={1536}
                alt="Wave Handler and AI Fin inviting you to find lost leads with the Free AI Wave Check"
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
            src={leadLeakImage}
            alt="Lead Leak Finder for spotting follow-up gaps and lost opportunities"
            loading="lazy"
            decoding="async"
          />
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
              Open My Lead Leak Finder →
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
              Show My Lead Leak Read →
            </button>
          </form>
        )}

        {leadLeakComplete && (
          <div className="lead-leak-result" role="status">
            <span aria-hidden="true">🌊</span>
            <div>
              <h3>Your Lead Leak Finder has started.</h3>
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

      <section className="product-section" id="product-wave" aria-labelledby="products-title">
        <div className="section-heading">
          <p className="eyebrow">THE AI SURFER PRODUCT WAVE</p>
          <h2 id="products-title">Start with the two clearest next steps.</h2>
          <p>
            Begin with the Free AI Wave Check or open the Lead Leak Finder when follow-up
            is the problem you already know needs attention.
          </p>
        </div>

        <WaveHandlerVisual />

        <div className="product-grid">
          {products.map((product, index) => (
            <article
              className={`product-card product-card--${product.stage.toLowerCase()} ${product.featured ? "product-card-featured" : ""}`}
              key={product.name}
            >
              <div className="product-card-art">
                {product.image ? (
                  <img src={product.image} alt="" loading="lazy" decoding="async" />
                ) : (
                  <div className="product-card-monogram" aria-hidden="true">
                    {product.name.split(" ").map((word) => word[0]).slice(0, 2).join("")}
                  </div>
                )}
                <span className="product-card-index" aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="product-card-content">
                <div className="product-topline">
                  <span className={`stage stage-${product.stage.toLowerCase()}`}>
                    {product.stage}
                  </span>
                  <span className="product-card-rule" aria-hidden="true" />
                </div>
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <a
                  className="product-card-cta"
                  href={product.href}
                  data-funnel-cta="product"
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
