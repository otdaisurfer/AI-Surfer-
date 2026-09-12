import { useEffect, useRef, useState } from "react";

import {
  generateMemberToolResult,
  memberTools,
  type MemberToolId,
  type MemberToolInput,
} from "./memberTools";

const emptyInput: MemberToolInput = {
  business: "",
  audience: "",
  goal: "",
  offer: "",
};

export default function MemberToolDock() {
  const [activeTool, setActiveTool] = useState<MemberToolId | null>(null);
  const [input, setInput] = useState(emptyInput);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const businessInputRef = useRef<HTMLInputElement>(null);

  const selectedTool = memberTools.find((tool) => tool.id === activeTool);

  useEffect(() => {
    if (!activeTool) return;
    workspaceRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    businessInputRef.current?.focus({ preventScroll: true });
  }, [activeTool]);

  const openTool = (toolId: MemberToolId) => {
    setActiveTool(toolId);
    setResult("");
    setError("");
    setCopied(false);
  };

  const generate = () => {
    if (!activeTool) return;
    try {
      setResult(generateMemberToolResult(activeTool, input));
      setError("");
      setCopied(false);
    } catch (caught) {
      setResult("");
      setError(caught instanceof Error ? caught.message : "Unable to build your result.");
    }
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
  };

  const reset = () => {
    setInput(emptyInput);
    setResult("");
    setError("");
    setCopied(false);
  };

  return (
    <section style={styles.section} aria-labelledby="member-tool-dock-title">
      <div style={styles.heading}>
        <div>
          <p style={styles.kicker}>USE IT RIGHT NOW</p>
          <h2 id="member-tool-dock-title" style={styles.title}>Members Tool Dock</h2>
          <p style={styles.intro}>Choose a tool, add your business details, and get a ready-to-use result.</p>
        </div>
        <span style={styles.included}>Included with membership</span>
      </div>

      <div style={styles.toolGrid}>
        {memberTools.map((tool) => (
          <article key={tool.id} style={activeTool === tool.id ? styles.activeCard : styles.card}>
            <span style={styles.icon} aria-hidden="true">{tool.icon}</span>
            <strong style={styles.toolName}>{tool.name}</strong>
            <p style={styles.description}>{tool.description}</p>
            <button type="button" onClick={() => openTool(tool.id)} style={styles.openButton}>
              {activeTool === tool.id ? "Tool Open ↓" : "Open Tool"}
            </button>
          </article>
        ))}
      </div>

      {selectedTool && (
        <div ref={workspaceRef} style={styles.workspace}>
          <div style={styles.workspaceHeading}>
            <div>
              <p style={styles.kicker}>NOW BUILDING</p>
              <h3 style={styles.workspaceTitle}>{selectedTool.icon} {selectedTool.name}</h3>
            </div>
            <button type="button" onClick={() => setActiveTool(null)} style={styles.closeButton} aria-label="Close tool">×</button>
          </div>

          <div style={styles.formGrid}>
            <label style={styles.label}>
              Business name
              <input ref={businessInputRef} name="business" value={input.business} onChange={(event) => setInput({ ...input, business: event.target.value })} placeholder="Ocean Tide Drop AI SURFER" style={styles.input} />
            </label>
            <label style={styles.label}>
              Ideal customer
              <input value={input.audience} onChange={(event) => setInput({ ...input, audience: event.target.value })} placeholder="Busy local business owners" style={styles.input} />
            </label>
            <label style={styles.label}>
              Main goal
              <input value={input.goal} onChange={(event) => setInput({ ...input, goal: event.target.value })} placeholder="generate more qualified leads" style={styles.input} />
            </label>
            <label style={styles.label}>
              Product or service
              <input value={input.offer} onChange={(event) => setInput({ ...input, offer: event.target.value })} placeholder="AI Wave Check" style={styles.input} />
            </label>
          </div>

          {error && <p role="alert" style={styles.error}>{error}</p>}

          <div style={styles.actions}>
            <button type="button" onClick={generate} style={styles.generateButton}>Build My Result 🌊</button>
            <button type="button" onClick={reset} style={styles.resetButton}>Start Over</button>
          </div>

          {result && (
            <div style={styles.resultWrap} aria-live="polite">
              <div style={styles.resultHeading}>
                <strong>Your result is ready</strong>
                <button type="button" onClick={copyResult} style={styles.copyButton}>{copied ? "Copied ✓" : "Copy Result"}</button>
              </div>
              <pre style={styles.result}>{result}</pre>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

const styles: Record<string, React.CSSProperties> = {
  section: { maxWidth: 1200, margin: "0 auto 48px", padding: 24, borderRadius: 24, border: "1px solid rgba(34,211,238,.3)", background: "linear-gradient(145deg,rgba(8,25,45,.96),rgba(15,23,42,.92))", boxShadow: "0 24px 70px rgba(0,0,0,.28)" },
  heading: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "end", gap: 16, marginBottom: 20 },
  kicker: { margin: "0 0 7px", color: "#67e8f9", fontSize: 12, fontWeight: 900, letterSpacing: 2 },
  title: { margin: 0, fontSize: "clamp(1.8rem,5vw,2.7rem)" },
  intro: { maxWidth: 620, margin: "8px 0 0", color: "#94a3b8", lineHeight: 1.55 },
  included: { padding: "8px 13px", border: "1px solid rgba(52,211,153,.35)", borderRadius: 999, color: "#a7f3d0", fontSize: 12, fontWeight: 800 },
  toolGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 14 },
  card: { display: "flex", minHeight: 220, flexDirection: "column", padding: 19, border: "1px solid #203a52", borderRadius: 18, background: "rgba(15,23,42,.75)" },
  activeCard: { display: "flex", minHeight: 220, flexDirection: "column", padding: 19, border: "1px solid #67e8f9", borderRadius: 18, background: "rgba(8,47,73,.72)", boxShadow: "0 0 24px rgba(34,211,238,.13)" },
  icon: { fontSize: 31 },
  toolName: { marginTop: 12, fontSize: 17 },
  description: { margin: "8px 0 18px", color: "#94a3b8", lineHeight: 1.45, fontSize: 14 },
  openButton: { width: "100%", marginTop: "auto", padding: "11px 14px", border: "1px solid rgba(103,232,249,.4)", borderRadius: 999, background: "rgba(34,211,238,.1)", color: "#cffafe", fontWeight: 850, cursor: "pointer" },
  workspace: { marginTop: 20, padding: "clamp(18px,4vw,30px)", border: "1px solid rgba(244,114,182,.32)", borderRadius: 20, background: "rgba(2,6,23,.72)" },
  workspaceHeading: { display: "flex", justifyContent: "space-between", gap: 16, alignItems: "start" },
  workspaceTitle: { margin: 0, fontSize: "clamp(1.35rem,4vw,2rem)" },
  closeButton: { width: 38, height: 38, border: "1px solid #334155", borderRadius: 999, background: "transparent", color: "white", fontSize: 24, cursor: "pointer" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 15, marginTop: 22 },
  label: { display: "grid", gap: 7, color: "#cbd5e1", fontSize: 13, fontWeight: 800 },
  input: { width: "100%", minHeight: 48, padding: "11px 13px", border: "1px solid #334155", borderRadius: 12, outline: "none", background: "#081323", color: "white", fontSize: 16 },
  error: { margin: "15px 0 0", color: "#fecdd3", fontWeight: 750 },
  actions: { display: "flex", flexWrap: "wrap", gap: 10, marginTop: 20 },
  generateButton: { minHeight: 48, padding: "12px 19px", border: 0, borderRadius: 999, background: "linear-gradient(90deg,#22d3ee,#60a5fa,#f472b6)", color: "#03131d", fontWeight: 900, cursor: "pointer" },
  resetButton: { minHeight: 48, padding: "12px 18px", border: "1px solid #334155", borderRadius: 999, background: "transparent", color: "#cbd5e1", fontWeight: 800, cursor: "pointer" },
  resultWrap: { marginTop: 22, padding: 18, border: "1px solid rgba(34,211,238,.28)", borderRadius: 16, background: "#07111f" },
  resultHeading: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 14 },
  copyButton: { padding: "9px 14px", border: 0, borderRadius: 999, background: "#67e8f9", color: "#06202a", fontWeight: 900, cursor: "pointer" },
  result: { margin: 0, whiteSpace: "pre-wrap", overflowWrap: "anywhere", color: "#dbeafe", fontFamily: "system-ui, sans-serif", fontSize: 14, lineHeight: 1.65 },
};
