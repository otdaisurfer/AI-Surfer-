import { useMemo, useState, type CSSProperties } from "react";
import { useNavigate } from "react-router-dom";

type PromptField = "context" | "role" | "task" | "accuracy" | "target" | "examples";
type PromptValues = Record<PromptField, string>;

const emptyPrompt: PromptValues = {
  context: "",
  role: "",
  task: "",
  accuracy: "",
  target: "",
  examples: "",
};

const fieldDefinitions: Array<{
  key: PromptField;
  label: string;
  helper: string;
  placeholder: string;
  color: string;
}> = [
  { key: "context", label: "Context", helper: "Background and situation", placeholder: "What should the AI know about your business or situation?", color: "#d8b4fe" },
  { key: "role", label: "Role", helper: "The expertise you need", placeholder: "Who should the AI act like?", color: "#67e8f9" },
  { key: "task", label: "Exact task", helper: "The result you want", placeholder: "What precisely should the AI create or do?", color: "#86efac" },
  { key: "accuracy", label: "Rules and guardrails", helper: "What to include or avoid", placeholder: "Add facts, limits, tone rules, and anything the AI must not do.", color: "#fdba74" },
  { key: "target", label: "Output format", helper: "How the answer should look", placeholder: "Example: a short email, numbered plan, table, or social post.", color: "#f9a8d4" },
  { key: "examples", label: "Examples", helper: "A model to follow", placeholder: "Add an example, reference, or style you like (optional).", color: "#fde047" },
];

const presets: Record<string, PromptValues> = {
  social: {
    context: "I run a local small business and want to attract nearby customers without sounding pushy.",
    role: "Act as an experienced local-business social media strategist.",
    task: "Write one engaging social post that explains a common customer problem and invites people to take the next step.",
    accuracy: "Use plain language. Do not invent facts, testimonials, prices, or guarantees. Avoid generic AI buzzwords.",
    target: "Return a hook, a short caption, one clear call to action, and five relevant hashtags.",
    examples: "Tone: warm, confident, helpful, and conversational.",
  },
  followup: {
    context: "A potential customer showed interest but has not replied yet.",
    role: "Act as a helpful sales follow-up specialist for a small business.",
    task: "Write a friendly follow-up message that restarts the conversation and makes replying easy.",
    accuracy: "Do not pressure the customer or create fake urgency. Keep the message under 100 words.",
    target: "Return a subject line and a ready-to-send message with one simple question.",
    examples: "Tone: personal, brief, and useful.",
  },
  customer: {
    context: "A customer has contacted my business with a question or concern.",
    role: "Act as a calm, empathetic customer-care specialist.",
    task: "Draft a response that acknowledges the customer, answers clearly, and gives the next step.",
    accuracy: "Do not admit fault, promise refunds, or invent policies unless I provide those facts.",
    target: "Return a concise customer reply followed by one internal follow-up note.",
    examples: "Tone: caring, professional, and solution-focused.",
  },
  aeo: {
    context: "I want my business information to be easy for search engines and AI assistants to understand and cite.",
    role: "Act as an AEO and local-search content strategist.",
    task: "Create a direct answer to a real customer question about my product or service.",
    accuracy: "Use only the business facts I provide. Do not invent locations, credentials, statistics, or claims.",
    target: "Return the customer question, a 40-to-70-word direct answer, three supporting facts, and a suggested page title.",
    examples: "Write clearly enough to be quoted by an AI answer engine.",
  },
};

export default function PromptArchitect() {
  const navigate = useNavigate();
  const [values, setValues] = useState<PromptValues>(emptyPrompt);
  const [copied, setCopied] = useState(false);

  const compiledPrompt = useMemo(
    () => fieldDefinitions
      .map(({ key, label }) => values[key].trim() ? "[" + label.toUpperCase() + "]\n" + values[key].trim() : "")
      .filter(Boolean)
      .join("\n\n"),
    [values],
  );

  const loadPreset = (key: keyof typeof presets) => {
    setValues(presets[key]);
    setCopied(false);
  };

  const copyPrompt = async () => {
    if (!compiledPrompt) return;
    await navigator.clipboard.writeText(compiledPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  const reset = () => {
    setValues(emptyPrompt);
    setCopied(false);
  };

  return (
    <main style={styles.page}>
      <button type="button" onClick={() => navigate("/members")} style={styles.back}>← Members Command Center</button>

      <header style={styles.hero}>
        <div style={styles.logo} aria-hidden="true">AI</div>
        <div>
          <p style={styles.kicker}>MEMBER TOOL · AI FIN READY 🐬</p>
          <h1 style={styles.title}>AI SURFER Prompt Architect™</h1>
          <p style={styles.subtitle}>Build smarter prompts. Get better AI results.</p>
        </div>
      </header>

      <div style={styles.presetWrap}>
        <strong>Start with a business template</strong>
        <div style={styles.presetButtons}>
          <button type="button" onClick={() => loadPreset("social")} style={styles.preset}>Social Post</button>
          <button type="button" onClick={() => loadPreset("followup")} style={styles.preset}>Sales Follow-Up</button>
          <button type="button" onClick={() => loadPreset("customer")} style={styles.preset}>Customer Reply</button>
          <button type="button" onClick={() => loadPreset("aeo")} style={styles.preset}>AEO Answer</button>
        </div>
      </div>

      <div style={styles.layout}>
        <section style={styles.panel} aria-labelledby="prompt-builder-title">
          <h2 id="prompt-builder-title" style={styles.sectionTitle}>Build your prompt</h2>
          <div style={styles.fields}>
            {fieldDefinitions.map((field) => (
              <label key={field.key} style={{ ...styles.field, borderColor: field.color + "55" }}>
                <span style={styles.labelRow}>
                  <strong style={{ color: field.color }}>{field.label}</strong>
                  <small style={styles.helper}>{field.helper}</small>
                </span>
                <textarea
                  value={values[field.key]}
                  onChange={(event) => {
                    setValues({ ...values, [field.key]: event.target.value });
                    setCopied(false);
                  }}
                  placeholder={field.placeholder}
                  rows={3}
                  style={styles.textarea}
                />
              </label>
            ))}
          </div>
        </section>

        <aside style={styles.previewPanel} aria-labelledby="prompt-preview-title">
          <div>
            <p style={styles.kicker}>LIVE PREVIEW</p>
            <h2 id="prompt-preview-title" style={styles.sectionTitle}>Your finished prompt</h2>
          </div>
          <pre style={styles.preview}>
            {compiledPrompt || "Choose a template or fill in the fields. Your ready-to-copy prompt will appear here."}
          </pre>
          <div style={styles.actions}>
            <button type="button" onClick={copyPrompt} disabled={!compiledPrompt} style={{ ...styles.copy, opacity: compiledPrompt ? 1 : 0.55 }}>
              {copied ? "Prompt Copied! ✓" : "Copy My Prompt"}
            </button>
            <button type="button" onClick={reset} style={styles.reset}>Start Over</button>
          </div>
          <p style={styles.tip}>Paste your prompt into ChatGPT or your favorite AI tool. Review facts before publishing.</p>
        </aside>
      </div>
    </main>
  );
}

const styles: Record<string, CSSProperties> = {
  page: { maxWidth: 1240, margin: "0 auto", padding: "24px clamp(16px,4vw,48px) 70px", color: "#f8fafc", fontFamily: "system-ui, sans-serif" },
  back: { marginBottom: 22, border: "1px solid rgba(103,232,249,.32)", borderRadius: 999, padding: "10px 15px", background: "rgba(8,47,73,.5)", color: "#cffafe", fontWeight: 800, cursor: "pointer" },
  hero: { display: "flex", alignItems: "center", gap: 16, marginBottom: 24 },
  logo: { width: 54, height: 54, flex: "0 0 54px", display: "grid", placeItems: "center", borderRadius: 16, background: "linear-gradient(135deg,#22d3ee,#60a5fa,#f472b6)", color: "#03131d", fontWeight: 950, boxShadow: "0 0 28px rgba(34,211,238,.28)" },
  kicker: { margin: "0 0 7px", color: "#67e8f9", fontSize: 12, fontWeight: 900, letterSpacing: 2 },
  title: { margin: 0, fontSize: "clamp(1.75rem,5vw,3.2rem)", lineHeight: 1.06 },
  subtitle: { margin: "8px 0 0", color: "#cbd5e1", fontSize: "clamp(1rem,2vw,1.15rem)" },
  presetWrap: { marginBottom: 20, padding: 18, border: "1px solid rgba(103,232,249,.25)", borderRadius: 20, background: "rgba(8,25,45,.86)" },
  presetButtons: { display: "flex", flexWrap: "wrap", gap: 9, marginTop: 12 },
  preset: { minHeight: 42, padding: "9px 14px", border: "1px solid rgba(103,232,249,.35)", borderRadius: 999, background: "rgba(34,211,238,.09)", color: "#cffafe", fontWeight: 800, cursor: "pointer" },
  layout: { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,440px),1fr))", gap: 20, alignItems: "start" },
  panel: { padding: "clamp(17px,3vw,26px)", border: "1px solid rgba(34,211,238,.25)", borderRadius: 24, background: "linear-gradient(145deg,rgba(8,25,45,.96),rgba(15,23,42,.94))", boxShadow: "0 24px 70px rgba(0,0,0,.25)" },
  previewPanel: { position: "sticky", top: 18, display: "grid", gap: 16, padding: "clamp(17px,3vw,26px)", border: "1px solid rgba(244,114,182,.3)", borderRadius: 24, background: "rgba(2,6,23,.92)", boxShadow: "0 24px 70px rgba(0,0,0,.25)" },
  sectionTitle: { margin: 0, fontSize: "clamp(1.35rem,3vw,2rem)" },
  fields: { display: "grid", gap: 13, marginTop: 18 },
  field: { display: "grid", gap: 9, padding: 14, border: "1px solid", borderRadius: 16, background: "rgba(2,6,23,.45)" },
  labelRow: { display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 6 },
  helper: { color: "#94a3b8", fontWeight: 650 },
  textarea: { width: "100%", minHeight: 82, resize: "vertical", border: "1px solid #334155", borderRadius: 12, padding: 12, background: "#07111f", color: "#f8fafc", font: "inherit", lineHeight: 1.45 },
  preview: { minHeight: 330, maxHeight: "58vh", margin: 0, overflow: "auto", whiteSpace: "pre-wrap", overflowWrap: "anywhere", padding: 16, border: "1px solid #243b53", borderRadius: 16, background: "#050b14", color: "#dbeafe", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 13, lineHeight: 1.6 },
  actions: { display: "flex", flexWrap: "wrap", gap: 10 },
  copy: { minHeight: 48, flex: "1 1 190px", border: 0, borderRadius: 999, padding: "12px 18px", background: "linear-gradient(90deg,#22d3ee,#60a5fa,#f472b6)", color: "#03131d", fontWeight: 950, cursor: "pointer" },
  reset: { minHeight: 48, border: "1px solid #334155", borderRadius: 999, padding: "12px 18px", background: "transparent", color: "#cbd5e1", fontWeight: 800, cursor: "pointer" },
  tip: { margin: 0, color: "#94a3b8", fontSize: 13, lineHeight: 1.5 },
};