import { useState } from "react";
import "./MembersLayout.css";
import { Link, Outlet } from "react-router-dom";

type TideMode = "auto" | "high" | "low";

type TideInfo = {
  overlay: string;
};

function getTideInfo(mode: TideMode): TideInfo {
  if (mode === "high") {
    return {
      overlay: "bg-cyan-950/10",
    };
  }

  if (mode === "low") {
    return {
      overlay: "bg-slate-950/35",
    };
  }

  return {
    overlay: "bg-slate-950/20",
  };
}

export default function MembersLayout() {
  const [tideMode] = useState<TideMode>("auto");

  const tide = getTideInfo(tideMode);

  return (
    <div
      className="
        members-shell
        min-h-screen
        bg-cover
        bg-center
        bg-fixed
        bg-no-repeat
        text-white
      "
      style={{
        backgroundImage: 'url("/OTD-AI-Surfer-Members-bg.png")',
      }}
    >
      <div
        className={`
          min-h-screen
          p-4
          md:p-6
          ${tide.overlay}
        `}
      >
        <div className="members-layout-row">
          <aside
            className="
              hidden
              lg:flex
              w-64
              shrink-0
              flex-col
              rounded-3xl
              bg-white/10
              backdrop-blur-xl
              border
              border-white/20
              p-6
              shadow-2xl
              h-fit
            "
          >
            <div className="mb-6">
              <div className="text-xs uppercase tracking-[0.3em] text-cyan-300">
                Ocean Tide Drop
              </div>

              <h2 className="mt-2 text-2xl font-black">
                AI SURFER
              </h2>

              <p className="mt-2 text-sm text-white/60">
                Members Command Deck
              </p>
            </div>

            <nav aria-label="Members navigation" className="mb-6 grid gap-3">
              <Link to="/members" className="font-bold text-cyan-200">Command Center</Link>
              <Link to="/members/pricing" className="font-bold text-pink-200">Pricing & Payments</Link>
            </nav>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-4">
              <div className="text-xs uppercase tracking-widest text-white/50">
                Status
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />

                <span className="text-sm font-semibold">
                  Surfer Online
                </span>
              </div>
            </div>
          </aside>

          <main className="members-content">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
