import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCatalog from './components/ProductCatalog';

interface Tier {
  name: string;
  basePrice: number;
  features: string[];
}

const tiers: Tier[] = [
  { name: 'Starter Access', basePrice: 49, features: ['Ready-to-use AI tools for everyday business tasks', 'Simple automations that save time each week', 'Ongoing support when you need a hand'] },
  { name: 'Innovator Tier', basePrice: 99, features: ['AI tools plus a central business dashboard', 'Quarterly AI opportunity and growth insights', 'Dedicated support for your setup'] },
  { name: 'Console Tier', basePrice: 149, features: ['Advanced AI tools and business consoles', 'Custom automations built around your workflow', 'Priority onboarding to get you moving faster'] },
  { name: 'Full Takeover', basePrice: 497, features: ['A tailored AI system for your business', 'Custom tools, workflows, and console access', 'Direct 1-on-1 strategy and implementation guidance'] },
];

const showcase = [
  { image: '/packages/ai-business-starter-kit.jpg', label: 'AI Business Starter Kit', copy: 'A friendly first step into practical AI, prompts, simple automation, and momentum.' },
  { image: '/packages/customer-care-cove.jpg', label: 'Customer Care Cove', copy: 'Keep customer conversations flowing with faster answers, better support, and smart escalation.' },
  { image: '/packages/automation-architect.jpg', label: 'Automation Architect', copy: 'Connect the tools. Remove repetitive work. Build the flow behind the business.' },
  { image: '/packages/content-creator.jpg', label: 'Content Creator', copy: 'Turn one idea into a repeatable content current across channels.' },
  { image: '/packages/sales-rider.jpg', label: 'Sales Rider', copy: 'Catch leads. Follow up faster. Convert more opportunities.' },
  { image: '/packages/big-kahuna.jpg', label: 'Big Kahuna', copy: 'Build visibility, authority, automation, and growth together.' },
  { image: '/packages/product-ladder.jpg', label: 'AI Surfer Product Ladder', copy: 'See the path from first insight to a fully connected AI growth engine.' },
  { image: '/packages/otd-ai-surfers.jpg', label: 'Built by the Ocean', copy: 'Powered by AI. Driven by purpose. Sailor, Stormy, and Sky bring the brand story home.' },
];

function ShowcaseImage({ src, alt, delay = 0 }: { src: string; alt: string; delay?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return <div style={styles.imageFallback}><span>🌊</span><strong>{alt}</strong><small>Artwork ready to sync</small></div>;
  }
  return (
    <img
      className="ai-showcase-image"
      src={src}
      alt={alt}
      style={{ ...styles.showcaseImage, animationDelay: `${delay}s` }}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

export default function App() {
  const [selectedTier, setSelectedTier] = useState<Tier | null>(null);
  const [email, setEmail] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discountRate, setDiscountRate] = useState(0);
  const [promoStatus, setPromoStatus] = useState<{ msg: string; success: boolean } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenCheckout = (tier: Tier) => {
    setSelectedTier(tier);
    setPromoCode('');
    setDiscountRate(0);
    setPromoStatus(null);
  };

  const handleApplyPromo = () => {
    const code = promoCode.trim().toUpperCase();
    if (code === 'OCEANTIDE20') {
      setDiscountRate(0.2);
      setPromoStatus({ msg: '✓ 20% Launch discount applied!', success: true });
    } else if (!code) {
      setDiscountRate(0);
      setPromoStatus(null);
    } else {
      setDiscountRate(0);
      setPromoStatus({ msg: '• Invalid promo code.', success: false });
    }
  };

  const handleCheckoutSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedTier) return;
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, tierName: selectedTier.name, basePrice: selectedTier.basePrice, promoCode }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url;
      else alert(`Checkout Error: ${data.error || 'Failed to initiate Stripe session.'}`);
    } catch (error) {
      console.error(error);
      alert('Network error connecting to payment gateway.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes aiSurferDrift {
          0%, 100% { transform: scale(1.01) translate3d(0, 0, 0); }
          50% { transform: scale(1.045) translate3d(0, -8px, 0); }
        }
        @keyframes aiSurferCardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        .ai-showcase-card { animation: aiSurferCardFloat 7s ease-in-out infinite; }
        .ai-showcase-image { animation: aiSurferDrift 9s ease-in-out infinite; transition: transform .65s ease, filter .65s ease; }
        .ai-showcase-card:hover .ai-showcase-image { transform: scale(1.075); filter: saturate(1.12) brightness(1.04); }
        .ai-showcase-card:hover { box-shadow: 0 30px 90px rgba(56,189,248,.24) !important; border-color: rgba(103,232,249,.42) !important; }
        @media (prefers-reduced-motion: reduce) {
          .ai-showcase-card, .ai-showcase-image { animation: none !important; transition: none !important; }
        }
      `}</style>
      <div style={styles.glowOne} />
      <div style={styles.glowTwo} />
      <div style={styles.container}>
        <nav style={styles.nav}>
          <div>
            <span style={styles.brand}>🌊 Ocean Tide Drop AI SURFER</span>
            <div style={styles.brandSub}>BUILD · AUTOMATE · GROW</div>
          </div>
          <Link to="/members" style={styles.navBtn}>Member Dashboard</Link>
        </nav>

        <header style={styles.hero}>
          <div style={styles.heroPill}>PRACTICAL AI FOR REAL BUSINESSES</div>
          <h1 style={styles.heroTitle}>Ride the AI wave.<br /><span style={styles.gradientText}>Build a brighter business tomorrow.</span></h1>
          <p style={styles.heroLead}>Ocean Tide Drop AI SURFER helps businesses automate repetitive work, respond faster, capture more opportunities, and become easier for AI to understand, trust, cite, and recommend.</p>
          <div style={styles.heroActions}>
            <Link to="/wave-check" style={styles.cta}>Get My Free AI Wave Check™</Link>
            <a href="#ai-surfer-products" style={styles.secondaryCta}>Explore the AI Surfer Crew ↓</a>
          </div>
          <div style={styles.statRow}>
            <div style={styles.stat}><strong>AI Visibility</strong><span>Get found by search + AI</span></div>
            <div style={styles.stat}><strong>Automation</strong><span>Save time every week</span></div>
            <div style={styles.stat}><strong>Leads</strong><span>Follow up before they drift away</span></div>
            <div style={styles.stat}><strong>Freedom</strong><span>Build systems that keep flowing</span></div>
          </div>
        </header>

        <section style={styles.waveCheck} aria-labelledby="free-wave-check-title">
          <div style={styles.waveCheckIcon}>🔎</div>
          <div style={styles.waveCheckCopy}>
            <p style={styles.eyebrow}>FREE AI VISIBILITY CHECK</p>
            <h2 id="free-wave-check-title" style={styles.waveCheckTitle}>Can AI find, understand, and recommend your business?</h2>
            <p style={styles.muted}>Get a fast read on visibility gaps, missed opportunities, and the first AI-powered move worth making.</p>
          </div>
          <Link to="/wave-check" style={styles.cta}>Start Free →</Link>
        </section>

        <section style={styles.showcaseSection}>
          <p style={styles.eyebrow}>THE AI SURFER WORLD</p>
          <h2 style={styles.sectionTitle}>A visual journey from overwhelmed to unstoppable. 🌊</h2>
          <p style={styles.sectionLead}>We are using the artwork as part of the sales story, not decoration. Each panel shows a business problem, the AI Surfer solution, and the outcome waiting on the other side of the wave.</p>
          <div style={styles.showcaseGrid}>
            {showcase.map((item, index) => (
              <article
                key={item.label}
                className="ai-showcase-card"
                style={{
                  ...styles.showcaseCard,
                  ...((index === 0 || index === 6 || index === 7) ? styles.showcaseCardWide : {}),
                  animationDelay: `${index * 0.45}s`,
                }}
              >
                <ShowcaseImage src={item.image} alt={`${item.label} AI Surfer artwork`} delay={index * 0.35} />
                <div style={styles.showcaseOverlay}>
                  <span style={styles.showcaseLabel}>{item.label}</span>
                  <p style={styles.showcaseCopy}>{item.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <ProductCatalog />

        <section style={styles.offer}>
          <p style={styles.eyebrow}>LAUNCH SPECIAL</p>
          <h2 style={styles.sectionTitle}>Start with practical AI and save 20% 🌺</h2>
          <p style={styles.sectionLead}>Use code <strong>OCEANTIDE20</strong> for 20% off recurring access while you choose the level of AI support that fits your business today.</p>
        </section>

        <section style={styles.pricing}>
          <p style={styles.eyebrow}>CHOOSE YOUR LEVEL OF SUPPORT</p>
          <h2 style={styles.sectionTitle}>Find the right AI setup for your business 🏄‍♀️</h2>
          <p style={styles.pricingIntro}>Start with ready-to-use tools or move up to custom automations and a tailored AI system.</p>
          <div style={styles.grid}>
            {tiers.map((tier) => (
              <div key={tier.name} style={styles.card}>
                <h3>{tier.name}</h3>
                <div style={styles.price}>${(tier.basePrice * 0.8).toFixed(2)}<small>/mo</small></div>
                <ul style={styles.featureList}>{tier.features.map((feature) => <li key={feature}>✓ {feature}</li>)}</ul>
                <button onClick={() => handleOpenCheckout(tier)} style={styles.cta}>Choose This Plan</button>
              </div>
            ))}
          </div>
        </section>
      </div>

      {selectedTier && (
        <div style={styles.overlay}>
          <div style={styles.modal}>
            <button onClick={() => setSelectedTier(null)} style={styles.close} aria-label="Close checkout">×</button>
            <h3>{selectedTier.name}</h3>
            <form onSubmit={handleCheckoutSubmit}>
              <input required type="email" placeholder="surfer@oceantide.ai" value={email} onChange={(event) => setEmail(event.target.value)} style={styles.input} />
              <div style={{ display: 'flex', gap: 8 }}>
                <input placeholder="OCEANTIDE20" value={promoCode} onChange={(event) => setPromoCode(event.target.value)} style={styles.input} />
                <button type="button" onClick={handleApplyPromo}>Apply</button>
              </div>
              {promoStatus && <p style={{ color: promoStatus.success ? '#4ade80' : '#f87171' }}>{promoStatus.msg}</p>}
              <p>Total: <strong>${(selectedTier.basePrice * (1 - discountRate)).toFixed(2)}/mo</strong></p>
              <button disabled={loading} style={{ ...styles.cta, width: '100%' }}>{loading ? 'Connecting to Stripe...' : 'Complete Registration 🚀'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', position: 'relative', overflow: 'hidden', background: 'radial-gradient(circle at 50% -10%, #123c62 0%, #071423 34%, #030811 72%)', color: '#fff', fontFamily: 'Inter, system-ui, sans-serif' },
  glowOne: { position: 'absolute', width: 560, height: 560, borderRadius: '50%', background: 'rgba(0, 223, 255, .10)', filter: 'blur(110px)', top: 120, left: -280, pointerEvents: 'none' },
  glowTwo: { position: 'absolute', width: 620, height: 620, borderRadius: '50%', background: 'rgba(35, 116, 255, .10)', filter: 'blur(130px)', top: 760, right: -300, pointerEvents: 'none' },
  container: { maxWidth: 1240, margin: '0 auto', padding: '0 20px', position: 'relative', zIndex: 1 },
  nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '26px 0', borderBottom: '1px solid rgba(255,255,255,.08)' },
  brand: { display: 'flex', alignItems: 'center', gap: 12, fontWeight: 950, letterSpacing: '.05em' },
  brandSub: { marginTop: 3, color: '#67e8f9', fontSize: '.6rem', fontWeight: 800, letterSpacing: '.26em' },
  navBtn: { background: 'linear-gradient(90deg,#67e8f9,#38bdf8)', color: '#00131c', fontWeight: 900, padding: '10px 20px', borderRadius: 999, textDecoration: 'none', boxShadow: '0 10px 30px rgba(56,189,248,.18)' },
  hero: { textAlign: 'center', padding: '94px 20px 70px' },
  heroPill: { display: 'inline-block', padding: '9px 14px', borderRadius: 999, border: '1px solid rgba(103,232,249,.30)', background: 'rgba(8,38,58,.55)', color: '#a5f3fc', fontSize: '.72rem', fontWeight: 900, letterSpacing: '.14em' },
  heroTitle: { maxWidth: 1000, margin: '24px auto 0', fontSize: 'clamp(3rem, 7vw, 6.4rem)', lineHeight: .94, letterSpacing: '-.055em' },
  gradientText: { background: 'linear-gradient(90deg,#ffffff 0%,#a5f3fc 35%,#38bdf8 72%,#7dd3fc 100%)', WebkitBackgroundClip: 'text', color: 'transparent' },
  heroLead: { maxWidth: 860, margin: '28px auto 0', fontSize: 'clamp(1.05rem, 2vw, 1.3rem)', lineHeight: 1.65, color: '#d4e3f3' },
  heroActions: { display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginTop: 32 },
  cta: { display: 'inline-block', background: 'linear-gradient(90deg,#67e8f9,#38bdf8)', color: '#00131c', fontWeight: 950, padding: '14px 26px', borderRadius: 999, border: 0, cursor: 'pointer', textDecoration: 'none', boxShadow: '0 12px 34px rgba(56,189,248,.20)' },
  secondaryCta: { display: 'inline-block', color: '#dff9ff', fontWeight: 850, padding: '13px 25px', borderRadius: 999, border: '1px solid rgba(103,232,249,.35)', background: 'rgba(255,255,255,.035)', textDecoration: 'none' },
  statRow: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12, maxWidth: 980, margin: '46px auto 0' },
  stat: { display: 'grid', gap: 5, padding: '18px 16px', borderRadius: 20, background: 'linear-gradient(145deg,rgba(255,255,255,.06),rgba(255,255,255,.025))', border: '1px solid rgba(255,255,255,.08)', color: '#a8bed1', fontSize: '.84rem' },
  waveCheck: { display: 'flex', alignItems: 'center', gap: 22, maxWidth: 980, margin: '0 auto 72px', padding: '28px 30px', borderRadius: 28, border: '1px solid rgba(103,232,249,.32)', background: 'linear-gradient(135deg,rgba(14,52,78,.94),rgba(5,18,33,.96))', boxShadow: '0 22px 80px rgba(0,0,0,.28)', flexWrap: 'wrap' },
  waveCheckIcon: { width: 64, height: 64, display: 'grid', placeItems: 'center', borderRadius: 20, background: 'linear-gradient(145deg,#164e63,#0e7490)', fontSize: '1.8rem' },
  waveCheckCopy: { flex: 1, minWidth: 240 },
  waveCheckTitle: { margin: 0, fontSize: 'clamp(1.5rem,3vw,2.2rem)' },
  eyebrow: { margin: '0 0 12px', color: '#67e8f9', fontSize: '.76rem', fontWeight: 950, letterSpacing: '.18em' },
  muted: { color: '#a7bacd', lineHeight: 1.65 },
  showcaseSection: { padding: '52px 0 74px', textAlign: 'center' },
  sectionTitle: { margin: '0 auto', fontSize: 'clamp(2.1rem,5vw,4rem)', lineHeight: 1.02, letterSpacing: '-.035em' },
  sectionLead: { maxWidth: 760, margin: '18px auto 34px', color: '#a8b7cc', lineHeight: 1.7, fontSize: '1.04rem' },
  showcaseGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(250px,1fr))', gap: 18, alignItems: 'stretch' },
  showcaseCard: { position: 'relative', minHeight: 430, overflow: 'hidden', borderRadius: 28, border: '1px solid rgba(103,232,249,.16)', background: '#07111f', boxShadow: '0 24px 70px rgba(0,0,0,.30)', willChange: 'transform' },
  showcaseCardWide: { gridColumn: 'span 2' },
  showcaseImage: { width: '100%', height: '100%', minHeight: 430, objectFit: 'cover', display: 'block', willChange: 'transform' },
  imageFallback: { minHeight: 430, height: '100%', display: 'grid', placeItems: 'center', alignContent: 'center', gap: 8, padding: 28, background: 'radial-gradient(circle at 50% 18%,rgba(14,116,144,.55),rgba(3,13,25,.98) 70%)', color: '#dff9ff', textAlign: 'center' },
  showcaseOverlay: { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textAlign: 'left', padding: 24, background: 'linear-gradient(180deg,transparent 48%,rgba(1,8,18,.18) 58%,rgba(1,8,18,.94) 100%)', pointerEvents: 'none' },
  showcaseLabel: { display: 'inline-block', alignSelf: 'flex-start', padding: '8px 11px', borderRadius: 999, background: 'rgba(103,232,249,.95)', color: '#00131c', fontWeight: 950, fontSize: '.76rem', letterSpacing: '.08em', textTransform: 'uppercase' },
  showcaseCopy: { maxWidth: 430, margin: '10px 0 0', color: '#e9f7ff', fontWeight: 750, lineHeight: 1.45 },
  offer: { textAlign: 'center', padding: '72px 20px', maxWidth: 900, margin: '0 auto', borderTop: '1px solid rgba(255,255,255,.08)' },
  pricing: { textAlign: 'center', padding: '30px 0 110px' },
  pricingIntro: { maxWidth: 760, margin: '14px auto 34px', color: '#94a3b8', lineHeight: 1.65 },
  grid: { display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' },
  card: { background: 'linear-gradient(155deg,rgba(12,30,52,.98),rgba(5,14,27,.98))', border: '1px solid rgba(103,232,249,.22)', borderRadius: 26, padding: 28, width: 240, boxShadow: '0 20px 60px rgba(0,0,0,.22)' },
  featureList: { textAlign: 'left', paddingLeft: 18, lineHeight: 1.62, color: '#cbd5e1' },
  price: { fontSize: '2rem', fontWeight: 900, color: '#67e8f9' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,.88)', display: 'grid', placeItems: 'center', zIndex: 1000 },
  modal: { background: '#060c18', border: '1px solid #67e8f9', borderRadius: 22, padding: 30, width: '90%', maxWidth: 480, boxShadow: '0 35px 100px rgba(0,0,0,.55)' },
  close: { float: 'right', background: 'none', border: 0, color: '#fff', fontSize: 28, cursor: 'pointer' },
  input: { width: '100%', boxSizing: 'border-box', padding: 12, margin: '8px 0', borderRadius: 10, background: '#111827', color: '#fff', border: '1px solid #334155' },
};