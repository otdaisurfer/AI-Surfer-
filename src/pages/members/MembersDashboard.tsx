import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";
import MemberToolDock from "./MemberToolDock";

const products = [
  ["🔎", "Wave Scout", "Find AI opportunities and qualified leads.", "wave-scout"],
  ["💰", "Sales Rider", "Turn conversations into a repeatable sales system.", "sales-rider"],
  ["✍️", "Content Creator", "Build an AI-powered content engine.", "content-creator"],
  ["💬", "Customer Care Cove", "Automate helpful customer support.", "customer-care-cove"],
  ["⚙️", "Automation Architect", "Connect the workflows that keep business moving.", "automation-architect"],
  ["🐋", "Big Kahuna", "High-touch AI strategy and implementation.", "big-kahuna"],
];

export default function MembersDashboard() {
  const navigate = useNavigate();
  const { session, user, signOut: authSignOut } = useAuth();
  const [email, setEmail] = useState(user?.email ?? "");
  const [tier, setTier] = useState(
    user?.app_metadata?.role === "owner" ? "Owner" : "Member",
  );
  const [readinessStatus, setReadinessStatus] = useState<"idle" | "checking" | "ready" | "blocked" | "error">("idle");
  const [readinessMessage, setReadinessMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    setEmail(user.email ?? "");

    if (user.app_metadata?.role === "owner") {
      setTier("Owner");
      return;
    }

    supabase
      .from("users")
      .select("tier")
      .eq("auth_id", user.id)
      .maybeSingle()
      .then(({ data: profile }) => {
        if (profile?.tier) setTier(profile.tier);
      });
  }, [user]);

  const runLaunchReadiness = async () => {
    if (!session?.access_token) {
      setReadinessStatus("error");
      setReadinessMessage("Your owner session is unavailable. Sign in again and retry.");
      return;
    }

    setReadinessStatus("checking");
    setReadinessMessage("");

    try {
      const response = await fetch("/api/launch-readiness", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          Accept: "application/json",
        },
      });

      const body = await response.json() as {
        status?: "ready" | "blocked";
        blockers?: string[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(body.error || "The launch readiness check could not run.");
      }

      if (body.status === "ready") {
        setReadinessStatus("ready");
        setReadinessMessage("All production readiness checks passed. AI SURFER is launch-ready.");
        return;
      }

      setReadinessStatus("blocked");
      setReadinessMessage(
        body.blockers?.length
          ? `Blocked by: ${body.blockers.join(", ")}.`
          : "A production readiness blocker remains.",
      );
    } catch (error) {
      setReadinessStatus("error");
      setReadinessMessage(
        error instanceof Error ? error.message : "The launch readiness check could not run.",
      );
    }
  };

  const signOut = async () => {
    await authSignOut();
    navigate("/", { replace: true });
  };

  return (
    <main style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brandPanel} aria-label="Members Command Center brand">
          <span aria-hidden="true" style={styles.silverSparkles}>
            <motion.span style={styles.sparkleTopLeft} animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2.4, repeat: Infinity }}>✦</motion.span>
            <motion.span style={styles.sparkleTopRight} animate={{ opacity: [0.45, 1, 0.45], scale: [0.9, 1.25, 0.9] }} transition={{ duration: 2.8, delay: 0.5, repeat: Infinity }}>✧</motion.span>
            <motion.span style={styles.sparkleBottomLeft} animate={{ opacity: [0.4, 1, 0.4], scale: [0.85, 1.15, 0.85] }} transition={{ duration: 2.6, delay: 0.9, repeat: Infinity }}>✧</motion.span>
            <motion.span style={styles.sparkleBottomRight} animate={{ opacity: [0.35, 1, 0.35], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 2.2, delay: 0.25, repeat: Infinity }}>✦</motion.span>
          </span>
          <div style={styles.brand}>🌊 AI-SURFER</div>
          <div style={styles.sub}>Members Command Center</div>
        </div>
        <button onClick={signOut} style={styles.signOut}>Sign out</button>
      </header>

      <section style={styles.hero}>
        <div>
          <p style={styles.kicker}>YOU'RE IN THE WATER 🏄‍♀️</p>
          <h1>Welcome to your AI-Surfer Dashboard.</h1>
          <p style={styles.copy}>{email || "Member"} · <strong>{tier}</strong></p>
        </div>
        <div style={styles.audit}>
          <div style={{ fontSize: 34 }}>🌺</div>
          <strong>Start with your AI Wave Audit</strong>
          <p>Discover where AI can create the biggest business impact.</p>
          <button onClick={() => navigate("/wave-audit")} style={styles.cta}>Launch Wave Audit</button>
        </div>
      </section>

      {tier === "Owner" && (
        <section style={styles.readiness}>
          <div>
            <p style={styles.kicker}>OWNER LAUNCH CONTROL</p>
            <h2 style={{ margin: 0 }}>Final Production Readiness</h2>
            <p style={styles.productText}>
              Run the private live check for OpenAI, HubSpot, Supabase, and Stripe without exposing server secrets.
            </p>
          </div>
          <div style={styles.readinessActions}>
            <button
              onClick={runLaunchReadiness}
              disabled={readinessStatus === "checking"}
              style={styles.cta}
            >
              {readinessStatus === "checking" ? "Checking production..." : "Run final readiness check"}
            </button>
            {readinessStatus !== "idle" && readinessStatus !== "checking" && (
              <p
                role="status"
                style={{
                  ...styles.readinessResult,
                  color: readinessStatus === "ready" ? "#86efac" : "#fda4af",
                }}
              >
                {readinessStatus === "ready" ? "✅ " : "⚠️ "}
                {readinessMessage}
              </p>
            )}
          </div>
        </section>
      )}

      <MemberToolDock />

      <section style={styles.productsSection}>
        <div style={styles.sectionHeading}>
          <div><p style={styles.kicker}>YOUR AI TOOLKIT</p><h2>Your AI Surfer Products</h2></div>
          <span style={styles.tierPill}>{tier}</span>
        </div>
        <div style={styles.grid}>
          {products.map(([icon, name, text, slug]) => (
            <button key={name} onClick={() => navigate(`/members/products/${slug}`)} style={styles.product}>
              <span style={{ fontSize: 30 }}>{icon}</span>
              <strong>{name}</strong>
              <span style={styles.productText}>{text}</span>
              <small>Open product →</small>
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "24px clamp(18px,5vw,70px) 70px", background: "transparent", color: "white", fontFamily: "system-ui, sans-serif" },
  header: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 30 },
  brandPanel: {
    position: "relative",
    isolation: "isolate",
    minWidth: 238,
    padding: "16px 22px",
    borderRadius: 18,
    border: "1px solid rgba(226,232,240,.3)",
    background: "rgba(2,6,23,.88)",
    backdropFilter: "blur(14px)",
    boxShadow: "0 14px 38px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08)",
  },
  silverSparkles: {
    position: "absolute",
    inset: -12,
    zIndex: 2,
    pointerEvents: "none",
    color: "#f8fafc",
    textShadow: "0 0 10px rgba(255,255,255,.95), 0 0 18px rgba(203,213,225,.75)",
  },
  sparkleTopLeft: { position: "absolute", top: 0, left: 8, fontSize: 19 },
  sparkleTopRight: { position: "absolute", top: 3, right: 4, fontSize: 16 },
  sparkleBottomLeft: { position: "absolute", bottom: 1, left: 26, fontSize: 14 },
  sparkleBottomRight: { position: "absolute", right: 22, bottom: -1, fontSize: 18 },
  brand: { position: "relative", zIndex: 3, fontWeight: 950, letterSpacing: 2.2, color: "#67e8f9", textShadow: "0 0 18px rgba(103,232,249,.34)" },
  sub: { position: "relative", zIndex: 3, marginTop: 4, color: "#f8fafc", fontSize: 14, fontWeight: 800, letterSpacing: ".04em" },
  signOut: { background: "transparent", border: "1px solid #31506a", color: "#cbd5e1", borderRadius: 999, padding: "9px 16px", cursor: "pointer" },
  hero: { maxWidth: 1200, margin: "0 auto 45px", display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 28, alignItems: "stretch" },
  kicker: { color: "#00f2fe", fontWeight: 800, letterSpacing: 2, fontSize: 13, marginBottom: 8 },
  copy: { color: "#94a3b8" },
  audit: { padding: 28, borderRadius: 22, background: "rgba(10,20,38,.85)", border: "1px solid rgba(0,242,254,.35)" },
  cta: { border: 0, borderRadius: 999, padding: "12px 18px", fontWeight: 800, cursor: "pointer", background: "linear-gradient(90deg,#00f2fe,#4facfe)" },
  readiness: { maxWidth: 1200, margin: "0 auto 32px", padding: 24, borderRadius: 22, border: "1px solid rgba(34,211,238,.35)", background: "rgba(8,47,73,.35)", display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 20, alignItems: "center" },
  readinessActions: { display: "grid", gap: 10, justifyItems: "start" },
  readinessResult: { margin: 0, fontWeight: 800, lineHeight: 1.5 },
  productsSection: { maxWidth: 1200, margin: "0 auto" },
  sectionHeading: { display: "flex", justifyContent: "space-between", alignItems: "end", gap: 20, marginBottom: 20 },
  tierPill: { border: "1px solid rgba(0,242,254,.35)", borderRadius: 999, padding: "8px 14px", color: "#a5f3fc", fontSize: 13, fontWeight: 800 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 18 },
  product: { minHeight: 180, textAlign: "left", display: "grid", gap: 9, padding: 22, borderRadius: 20, border: "1px solid #203a52", background: "rgba(10,20,38,.8)", color: "#fff", cursor: "pointer" },
  productText: { color: "#94a3b8", lineHeight: 1.45 },
};
