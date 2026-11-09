import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

      {/* HERO */}
      <section className="relative px-6 py-24 text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/20 via-transparent to-transparent" />

        <div className="relative z-10 max-w-5xl mx-auto">

          <h1 className="text-5xl md:text-7xl font-bold">
            🌊 Ocean Tide Drop AI Surfer
          </h1>

          <p className="mt-6 text-xl text-white/70">
            Build. Automate. Ride the AI Wave.
          </p>

          <p className="mt-4 text-white/50 max-w-2xl mx-auto">
            AI agents, automation, and business tools designed to help
            companies catch the next digital wave.
          </p>


          <div className="mt-10 flex justify-center gap-4 flex-wrap">

            <Link
              to="/pricing"
              className="px-8 py-3 rounded-full bg-cyan-500 text-black font-bold hover:bg-cyan-400"
            >
              View Plans
            </Link>

            <Link
              to="/login"
              className="px-8 py-3 rounded-full border border-white/20 hover:bg-white/10"
            >
              Member Login
            </Link>

          </div>

        </div>
      </section>


      {/* FEATURES */}
      <section className="px-6 py-16 grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold">
            🤖 AI Agents
          </h2>
          <p className="mt-3 text-white/60">
            Smart assistants that help businesses automate daily tasks.
          </p>
        </div>


        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold">
            ⚡ Automation
          </h2>
          <p className="mt-3 text-white/60">
            Connect workflows and let your business move like a clean wave.
          </p>
        </div>


        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-bold">
            🏄 AI Dashboard
          </h2>
          <p className="mt-3 text-white/60">
            Manage your tools, members, and AI services in one place.
          </p>
        </div>

      </section>


      {/* FOOTER */}
      <footer className="relative z-10 px-6 py-8 text-center text-xs text-white/30 border-t border-white/10">
        <p>© {new Date().getFullYear()} Ocean Tide Drop AI</p>
        <a
          href="tel:8438704590"
          className="mt-2 inline-block hover:text-white transition-colors"
        >
          Call/Text (843) 870-4590
        </a>
      </footer>


    </div>
  );
}
