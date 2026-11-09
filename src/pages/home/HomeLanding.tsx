import { Link } from "react-router-dom";
import SparklesOverlay from "../../components/SparklesOverlay";

const pillars = [
  {
    title: "Get Found",
    text: "Make your business easier for AI systems to understand, trust, cite, and recommend.",
    icon: "🔎",
  },
  {
    title: "Capture More Leads",
    text: "Turn interest into conversations with smarter lead capture, follow-up, and sales workflows.",
    icon: "🌊",
  },
  {
    title: "Save Time",
    text: "Automate repetitive work and handoffs so your team can spend more time on customers and growth.",
    icon: "⚡",
  },
  {
    title: "Grow with AI",
    text: "Build practical AI agents, automations, and business systems around the work that matters most.",
    icon: "🏄‍♀️",
  },
];

const journey = [
  ["1", "Ask the business question", "Start with the problem you actually want solved, not a pile of AI jargon."],
  ["2", "Find the right wave", "We map the opportunity to the right audit, blueprint, automation, or AI agent."],
  ["3", "Put AI to work", "You get a practical next step designed around your business and your goals."],
];

export default function HomeLanding() {
  return (
    <main style={styles.page}>
      <div style={styles.sparkleLayer} aria-hidden="true">
        <SparklesOverlay />
      </div>

      <div style={styles.contentLayer}>
        <section style={styles.hero}>
          <div style={styles.glowOne} />
          <div style={styles.glowTwo} />
          <div style={styles.heroInner}>
            <p style={styles.eyebrow}>OCEAN TIDE DROP AI SURFER</p>
            <h1 style={styles.title}>AI Marketing &amp; Automation for Small Businesses</h1>
            <p style={styles.lead}>
              Ride the AI wave with AI SURFER. We build AI-powered marketing, lead generation,
              automation, AI agents, and business systems that help small businesses get found,
              capture more leads, save time, and grow.
            </p>
            <p style={styles.location}>
              Charleston, SC • North Charleston • Lowcountry • South Carolina • Nationwide
            </p>
            <div style={styles.actions}>
              <Link to="/wave-check" style={styles.primaryButton}>Get My Free AI Wave Check™</Link>
              <Link to="/pricing" style={styles.secondaryButton}>Explore AI Solutions</Link>
            </div>
            <p style={styles.microcopy}>Start with one question. Catch the right wave. Build from there. 🌊</p>
          </div>
        </section>

        <section style={styles.section}>
          <p style={styles.eyebrow}>WHAT AI SURFER HELPS YOU DO</p>
          <h2 style={styles.sectionTitle}>Practical AI that moves the business forward</h2>
          <div style={styles.grid}>
            {pillars.map((pillar) => (
              <article key={pillar.title} style={styles.card}>
                <div style={styles.icon}>{pillar.icon}</div>
                <h3 style={styles.cardTitle}>{pillar.title}</h3>
                <p style={styles.cardText}>{pillar.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section style={styles.waveSection}>
          <div style={styles.wavePanel}>
            <p style={styles.eyebrow}>QUESTION → ANSWER → PRODUCT → OUTCOME</p>
            <h2 style={styles.sectionTitle}>Ask a business question. Catch the right AI wave.</h2>
            <p style={styles.sectionCopy}>
              AI should not feel like shopping in a hardware store without knowing what you are building.
              We start with the business question, identify the opportunity, and connect it to the right solution.
            </p>
            <div style={styles.journeyGrid}>
              {journey.map(([number, title, text]) => (
                <div key={number} style={styles.journeyCard}>
                  <span style={styles.number}>{number}</span>
                  <h3 style={styles.cardTitle}>{title}</h3>
                  <p style={styles.cardText}>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section style={styles.auditSection}>
          <div>
            <p style={styles.eyebrow}>START HERE</p>
            <h2 style={styles.auditTitle}>Can AI find, understand, and recommend your business?</h2>
            <p style={styles.sectionCopy}>
              Take the free AI Wave Check and get an instant look at where your biggest AI opportunity may be.
            </p>
          </div>
          <Link to="/wave-check" style={styles.primaryButton}>Start My Free Wave Check →</Link>
        </section>

        <section style={styles.finalCta}>
          <p style={styles.eyebrow}>RIDE THE WAVE 🌺</p>
          <h2 style={styles.sectionTitle}>Your business does not need more AI noise. It needs the right next move.</h2>
          <div style={styles.actions}>
            <Link to="/wave-check" style={styles.primaryButton}>Find My Biggest AI Opportunity</Link>
            <Link to="/login" style={styles.secondaryButton}>Member Sign In</Link>
          </div>
        </section>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", position: "relative", overflow: "hidden", background: "#04111f", color: "#f8fafc", fontFamily: "Inter, system-ui, sans-serif" },
  sparkleLayer: { position: "fixed", inset: 0, zIndex: 70, pointerEvents: "none" },
  contentLayer: { position: "relative", zIndex: 2 },
  hero: { position: "relative", overflow: "hidden", padding: "92px 20px 110px", background: "radial-gradient(circle at 50% 0%, rgba(0,229,255,.2), transparent 42%), linear-gradient(180deg,rgba(6,26,44,.92) 0%,rgba(4,17,31,.92) 100%)" },
  glowOne: { position: "absolute", width: 420, height: 420, borderRadius: "50%", background: "rgba(0,229,255,.11)", filter: "blur(70px)", top: -180, left: -120 },
  glowTwo: { position: "absolute", width: 360, height: 360, borderRadius: "50%", background: "rgba(255,73,186,.11)", filter: "blur(70px)", bottom: -180, right: -100 },
  heroInner: { position: "relative", maxWidth: 1040, margin: "0 auto", textAlign: "center" },
  eyebrow: { margin: "0 0 14px", color: "#67e8f9", fontSize: ".78rem", fontWeight: 900, letterSpacing: ".16em" },
  title: { margin: 0, fontSize: "clamp(2.7rem,7vw,5.6rem)", lineHeight: .98, letterSpacing: "-.055em", fontWeight: 900 },
  lead: { maxWidth: 900, margin: "28px auto 0", color: "#dbeafe", fontSize: "clamp(1.05rem,2vw,1.3rem)", lineHeight: 1.75 },
  location: { margin: "18px auto 0", color: "#93c5fd", fontSize: ".95rem", fontWeight: 700 },
  actions: { display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginTop: 30 },
  primaryButton: { display: "inline-block", padding: "15px 26px", borderRadius: 999, background: "linear-gradient(90deg,#22d3ee,#38bdf8)", color: "#02131f", fontWeight: 900, textDecoration: "none", boxShadow: "0 14px 40px rgba(34,211,238,.22)" },
  secondaryButton: { display: "inline-block", padding: "14px 25px", borderRadius: 999, border: "1px solid rgba(103,232,249,.42)", color: "#cffafe", fontWeight: 900, textDecoration: "none", background: "rgba(8,47,73,.28)" },
  microcopy: { marginTop: 18, color: "#94a3b8", fontSize: ".9rem" },
  section: { maxWidth: 1180, margin: "0 auto", padding: "86px 20px" },
  sectionTitle: { margin: "0 auto", maxWidth: 900, fontSize: "clamp(2rem,4vw,3.35rem)", lineHeight: 1.08, letterSpacing: "-.035em" },
  sectionCopy: { maxWidth: 820, margin: "18px auto 0", color: "#b6c7da", fontSize: "1.05rem", lineHeight: 1.7 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18, marginTop: 38 },
  card: { padding: 28, borderRadius: 24, border: "1px solid rgba(103,232,249,.18)", background: "linear-gradient(145deg,rgba(10,35,58,.9),rgba(5,21,36,.92))", boxShadow: "0 18px 60px rgba(0,0,0,.18)" },
  icon: { fontSize: "2rem", marginBottom: 16 },
  cardTitle: { margin: "0 0 10px", fontSize: "1.2rem" },
  cardText: { margin: 0, color: "#b6c7da", lineHeight: 1.65 },
  waveSection: { padding: "10px 20px 90px" },
  wavePanel: { maxWidth: 1180, margin: "0 auto", padding: "58px 30px", borderRadius: 32, textAlign: "center", border: "1px solid rgba(244,114,182,.22)", background: "radial-gradient(circle at 90% 10%,rgba(244,114,182,.12),transparent 32%),linear-gradient(145deg,rgba(8,33,58,.94),rgba(6,21,38,.94))" },
  journeyGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: 18, marginTop: 34 },
  journeyCard: { padding: 26, borderRadius: 22, background: "rgba(2,15,29,.72)", border: "1px solid rgba(103,232,249,.14)", textAlign: "left" },
  number: { display: "grid", placeItems: "center", width: 34, height: 34, borderRadius: "50%", marginBottom: 18, background: "linear-gradient(135deg,#22d3ee,#f472b6)", color: "#04111f", fontWeight: 900 },
  auditSection: { maxWidth: 1080, margin: "0 auto 90px", padding: "44px 30px", borderRadius: 28, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap", border: "1px solid rgba(34,211,238,.28)", background: "rgba(8,47,73,.58)" },
  auditTitle: { margin: 0, maxWidth: 700, fontSize: "clamp(1.8rem,4vw,2.7rem)", lineHeight: 1.1, letterSpacing: "-.03em" },
  finalCta: { textAlign: "center", padding: "30px 20px 110px", maxWidth: 980, margin: "0 auto" },
};