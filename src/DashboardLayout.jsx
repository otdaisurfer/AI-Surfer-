import { useState } from "react";
import OceanPulse from "./components/OceanPulse";

export default function DashboardLayout() {
  const [view, setView] = useState("control");

  const menu = [
    { id: "control", label: "🌊 Control Center" },
    { id: "agents", label: "🤖 AI Agents" },
    { id: "leads", label: "📈 Leads" },
    { id: "revenue", label: "💰 Revenue" },
    { id: "settings", label: "⚙️ Settings" },
  ];

  return (
    <div className="min-h-screen bg-black text-white flex">

      {/* 🌊 SIDEBAR */}
      <aside className="w-64 border-r border-white/10 p-4">
        <div className="text-xl font-bold mb-6">
          🌊 Ocean Tide OS
        </div>

        <nav className="space-y-2" aria-label="Dashboard navigation">
          {menu.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={view === item.id ? "page" : undefined}
              onClick={() => setView(item.id)}
              className={`w-full text-left px-3 py-2 rounded transition ${
                view === item.id
                  ? "bg-cyan-500 text-black font-semibold"
                  : "hover:bg-white/10 text-white/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </aside>

      {/* 🌊 MAIN PANEL */}
      <main className="flex-1 p-6 overflow-auto">

        {/* HEADER */}
        <div className="border-b border-white/10 pb-4 mb-6">
          <h1 className="text-2xl font-bold">
            {view === "control" && "Control Center"}
            {view === "agents" && "AI Agent Fleet"}
            {view === "leads" && "Lead Intelligence System"}
            {view === "revenue" && "Revenue Engine"}
            {view === "settings" && "System Settings"}
          </h1>

          <p className="text-white/50 text-sm mt-1">
            Ocean Tide AI is actively running autonomous optimization cycles.
          </p>
        </div>

        {/* 🌊 CONTROL CENTER */}
        {view === "control" && (
          <div className="space-y-6">

            {/* LIVE SYSTEM HEARTBEAT */}
            <OceanPulse />

            {/* STATUS STRIP */}
            <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-sm text-white/70">
              🔴 System Status: Autonomous • Learning • Optimizing funnels in real time • No manual intervention required
            </div>

            {/* LIVE ACTIVITY FEED */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">Live Activity Feed</h2>

              <Feed text="🤖 Agent WaveCloser-9 closed a $199 upgrade" />
              <Feed text="📈 Lead scored 94% intent from pricing page" />
              <Feed text="⚙️ Pricing engine adjusted conversion threshold (+2.1%)" />
              <Feed text="🌊 New visitor entered funnel → AI routing activated" />
            </div>
          </div>
        )}

        {/* 🤖 AGENTS */}
        {view === "agents" && (
          <Panel
            title="AI Agent Fleet"
            text="142 autonomous agents are currently running sales, lead scoring, and optimization workflows across your system."
          />
        )}

        {/* 📈 LEADS */}
        {view === "leads" && (
          <Panel
            title="Lead Intelligence System"
            text="AI is analyzing visitor behavior, scoring intent, and prioritizing high-value prospects in real time."
          />
        )}

        {/* 💰 REVENUE */}
        {view === "revenue" && (
          <Panel
            title="Revenue Engine"
            text="Dynamic pricing, conversion optimization, and upgrade triggers are continuously running."
          />
        )}

        {/* ⚙️ SETTINGS */}
        {view === "settings" && (
          <Panel
            title="System Settings"
            text="Configure AI behavior, pricing logic, funnel rules, and agent autonomy levels."
          />
        )}

      </main>
    </div>
  );
}

/* 🌊 LIVE FEED ITEM */
function Feed({ text }) {
  return (
    <div className="bg-white/5 border border-white/10 p-3 rounded-lg text-sm">
      {text}
    </div>
  );
}

/* 🌊 SIMPLE PANEL */
function Panel({ title, text }) {
  return (
    <div className="bg-white/5 border border-white/10 p-6 rounded-xl">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-white/60">{text}</p>
    </div>
  );
}
