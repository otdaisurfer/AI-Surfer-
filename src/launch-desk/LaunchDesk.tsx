import { useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, AlertTriangle, Copy, Gauge, Rocket, Send, Sparkles, Users } from "lucide-react";
import "./launch-desk.css";

type Activity = { label: string; status: "running" | "done" };
type Brief = { productBrief: string; audience: string; launchDate: string; constraints: string; assets: string; channels: string[] };

const channels = ["Email", "LinkedIn", "In-app", "Release notes"];
const starter: Brief = { productBrief: "A new production release improves onboarding speed and gives engineering teams a clearer activation path.", audience: "Engineering and product teams", launchDate: "", constraints: "", assets: "Product screenshots, release notes draft", channels: ["Email", "LinkedIn", "Release notes"] };

export default function LaunchDesk() {
  const [brief, setBrief] = useState<Brief>(starter);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [output, setOutput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const readiness = useMemo(() => activities.find((a) => a.label.startsWith("Readiness score")), [activities]);
  const update = (key: keyof Brief, value: string) => setBrief((b) => ({ ...b, [key]: value }));
  const toggleChannel = (channel: string) => setBrief((b) => ({ ...b, channels: b.channels.includes(channel) ? b.channels.filter((c) => c !== channel) : [...b.channels, channel] }));

  async function buildPlan() {
    setBusy(true); setOutput(""); setError(""); setActivities([]);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3001"}/api/launch`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brief) });
      if (!response.ok || !response.body) throw new Error(`Launch Desk API returned ${response.status}`);
      const reader = response.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      while (true) {
        const { value, done } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const chunks = buffer.split("\n\n"); buffer = chunks.pop() || "";
        for (const chunk of chunks) {
          const line = chunk.split("\n").find((l) => l.startsWith("data: ")); if (!line) continue;
          const event = JSON.parse(line.slice(6));
          if (event.type === "tool_progress") {
            const label = event.message || event.tool;
            setActivities((items) => event.status === "completed" ? [...items.filter((i) => i.label !== label), { label, status: "done" }] : [...items, { label, status: "running" }]);
          } else if (event.type === "text_delta") setOutput((current) => current + event.delta);
          else if (event.type === "error") setError(event.message);
        }
      }
    } catch (e) { setError(e instanceof Error ? e.message : "Could not reach Launch Desk."); }
    finally { setBusy(false); }
  }

  return <main className="launch-shell">
    <header className="launch-header">
      <div className="brand-mark"><span className="brand-icon"><Rocket size={19}/></span><div><strong>Launch Desk</strong><small>Engineering release command center</small></div></div>
      <div className="header-status"><span className="live-dot"/> Agent online <span className="divider"/> GPT-5.6 Terra</div>
    </header>

    <section className="launch-hero">
      <div><div className="eyebrow"><Sparkles size={15}/> TURN ROUGH IDEAS INTO RELEASES</div><h1>Plan the launch.<br/><span>Ship with confidence.</span></h1><p>Give Launch Desk the messy version. It turns the brief into a prioritized release plan, risk register, owners, and channel-ready copy.</p></div>
      <div className="hero-card"><div className="hero-card-icon"><Gauge/></div><div><strong>Launch readiness</strong><span>{readiness ? "Updated from your brief" : "Waiting for your brief"}</span></div><div className="score">{readiness ? "✓" : "--"}</div></div>
    </section>

    <div className="workspace">
      <section className="brief-panel panel"><div className="panel-title"><div><span className="step">01</span><div><h2>Launch brief</h2><p>The raw ingredients. Be as rough as you like.</p></div></div></div>
        <label>PRODUCT BRIEF<textarea value={brief.productBrief} onChange={(e) => update("productBrief", e.target.value)} placeholder="What are you launching? What changed? Why now?"/></label>
        <div className="two-col"><label><Users size={14}/> AUDIENCE<input value={brief.audience} onChange={(e) => update("audience", e.target.value)} placeholder="Who needs to care?"/></label><label><CalendarDays size={14}/> LAUNCH DATE<input type="date" value={brief.launchDate} onChange={(e) => update("launchDate", e.target.value)}/></label></div>
        <label>CONSTRAINTS<textarea className="compact" value={brief.constraints} onChange={(e) => update("constraints", e.target.value)} placeholder="Approvals, dependencies, rollout limits, legal, staffing…"/></label>
        <label>AVAILABLE ASSETS<textarea className="compact" value={brief.assets} onChange={(e) => update("assets", e.target.value)} placeholder="Docs, screenshots, demos, testimonials, videos…"/></label>
        <div className="channel-field"><span>LAUNCH CHANNELS</span><div className="channel-pills">{channels.map((channel) => <button key={channel} className={brief.channels.includes(channel) ? "selected" : ""} onClick={() => toggleChannel(channel)}>{brief.channels.includes(channel) && <CheckCircle2 size={13}/>} {channel}</button>)}</div></div>
        <button className="build-btn" disabled={busy || brief.channels.length === 0} onClick={buildPlan}>{busy ? <><span className="spinner"/> Building launch plan…</> : <><Send size={17}/> Build launch plan</>}</button>
        {error && <div className="error-box"><AlertTriangle size={16}/> {error}</div>}
      </section>

      <section className="result-panel panel"><div className="panel-title"><div><span className="step">02</span><div><h2>Launch intelligence</h2><p>Watch the agent work, then take the plan with you.</p></div></div><button className="copy-btn" disabled={!output} onClick={() => navigator.clipboard.writeText(output)}><Copy size={14}/> Copy</button></div>
        <div className="activity"><div className="activity-label">LIVE AGENT ACTIVITY</div>{activities.length === 0 ? <div className="empty-activity"><Sparkles size={18}/><span>Tool activity will appear here as Launch Desk works through your brief.</span></div> : activities.map((item, i) => <div className="activity-row" key={`${item.label}-${i}`}><span className={item.status === "done" ? "activity-check" : "activity-spinner"}>{item.status === "done" ? "✓" : ""}</span><span>{item.label}</span></div>)}</div>
        <div className="output-wrap">{output ? <article className="markdown-output">{output.split("\n").map((line, i) => line.startsWith("## ") ? <h3 key={i}>{line.slice(3)}</h3> : line.startsWith("- ") ? <div className="bullet" key={i}><span/> {line.slice(2)}</div> : line.trim() ? <p key={i}>{line}</p> : <div className="space" key={i}/>)}</article> : <div className="output-placeholder"><div className="placeholder-orb"><Sparkles size={28}/></div><h3>Your launch plan will land here</h3><p>Launch Desk will progressively stream the plan while it checks readiness, owners, risks, and messaging.</p></div>}</div>
      </section>
    </div>
    <footer><span>Launch Desk</span><span>Built for teams that would rather ship than scramble. 🌊</span></footer>
  </main>;
}
