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

const products = [
  {
    stage: "Discover",
    name: "Free AI Wave Check™",
    category: "Business AI Opportunity Check",
    description:
      "Answer five quick questions to see your strongest AI opportunity, practical first move, and the implementation path that fits.",
    cta: "Start the Free Wave Check",
    href: "/wave-check",
    image: "/images/file_00000000f10481f9a3d2f23cc759e7c6.png",
    featured: true,
  },
  {
    stage: "Diagnose",
    name: "Lead Leak Binder",
    category: "Lead Follow-Up Check",
    description:
      "See where leads are slipping away, organize the follow-up gaps, and identify the first automation worth fixing.",
    cta: "Open the Lead Leak Binder",
    href: "#lead-leak-finder",
    image: "/images/lead-leak-finder.png",
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
        <strong>The Free AI Wave Check is live</strong>
        <a href="/wave-check">Find my biggest AI opportunity →</a>
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
                alt="AI Fin dolphin inviting visitors to start the Free AI Wave Check"
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
            src="/images/file_00000000a1e481f9b0737d59a06238ce.png"
            alt="AI Fin finding lost leads in a glowing ocean sales pipeline"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="lead-leak-content">
          <p className="eyebrow">DIAGNOSE · CLIENT-READY SKILL</p>
          <h2 id="lead-leak-title">Lead Leak Binder</h2>
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
