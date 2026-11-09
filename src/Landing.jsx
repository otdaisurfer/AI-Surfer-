import { Link } from "react-router-dom";

// images
import homepageConcept from "../assets/images/ocean_ai_yacht.png";
import cyberWave from "../assets/images/cyber_surfer_wave_1779220118634.png";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">

      {/* 🌊 ambient ocean glow */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute w-[600px] h-[600px] bg-cyan-500 rounded-full blur-3xl top-[-200px] left-[-200px]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-600 rounded-full blur-3xl bottom-[-200px] right-[-200px]" />
      </div>

      {/* TOP BAR */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="font-bold tracking-wide">
          🌊 Ocean Tide AI OS
        </div>

        <div className="flex gap-5 text-sm text-white/70">
          <Link to="/login">Login</Link>
          <Link to="/dashboard">Open OS</Link>
          <Link to="/pricing">Upgrade</Link>
        </div>
      </div>

      {/* HERO */}
      <div className="relative z-10 text-center px-6 pt-24">

        <div className="inline-block px-3 py-1 rounded-full bg-white/10 text-xs text-white/60 mb-6">
          AI Operating System for Revenue Automation
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight">
          Your Business
          <br />
          <span className="text-cyan-400">Runs Like Software</span>
        </h1>

        <p className="mt-6 text-white/60 max-w-2xl mx-auto">
          Ocean Tide AI OS turns your business into an autonomous system of agents that sell, optimize, and scale in real time.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/dashboard"
            className="bg-cyan-500 text-black px-7 py-3 rounded-xl font-semibold"
          >
            ⚡ Enter OS
          </Link>

          <Link
            to="/pricing"
            className="border border-white/20 px-7 py-3 rounded-xl"
          >
            View Plans
          </Link>
        </div>

        <p className="mt-6 text-xs text-white/40">
          Live system • AI agents active • self-upgrading infrastructure
        </p>

        {/* --- Added images to make the landing more visual --- */}
        <div className="mt-10 max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8">
          <img
            src={homepageConcept}
            alt="Ocean AI yacht concept art"
            className="w-full max-w-md rounded-2xl shadow-2xl object-cover hidden md:block"
          />

          <div className="w-full md:max-w-2xl">
            <img
              src={cyberWave}
              alt="Cyber surfer wave graphic"
              className="w-full rounded-xl shadow-lg object-cover"
            />
            <p className="mt-3 text-sm text-white/50">Visuals: Ocean-theme artwork to reinforce the AI Surfer brand and convey motion, polish, and focus on outcomes.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
