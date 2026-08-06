import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Bot,
  Zap,
  Users,
  BarChart3,
  Waves,
  Star,
  Lock,
  Rocket,
  BadgeCheck,
  Mail,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import OceanBackground from "../../components/landing/OceanBackground";
import Navbar from "../../components/landing/Navbar";
import SunriseGlow from "../../components/landing/SunriseGlow";
import BioluminescentParticles from "../../components/landing/BioluminescentParticles";
import ChatAgent from "../../components/ChatAgent";

// ── Launch target: Aug 3 2026 midnight EDT ──────────────────────────────────
const LAUNCH_DATE = new Date("2026-08-03T00:00:00-04:00");

function useCountdown() {
  const calc = () => {
    const diff = LAUNCH_DATE.getTime() - Date.now();
    if (diff <= 0) return { h: 0, m: 0, s: 0, done: true };
    const h = Math.floor(diff / 3_600_000);
    const m = Math.floor((diff % 3_600_000) / 60_000);
    const s = Math.floor((diff % 60_000) / 1_000);
    return { h, m, s, done: false };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1_000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export default function NewLanding() {
  const countdown = useCountdown();

  // ── Founding member email form ─────────────────────────────────────────────
  const [fmName,  setFmName]   = useState("");
  const [fmEmail, setFmEmail]  = useState("");
  const [fmState, setFmState]  = useState<"idle"|"loading"|"done"|"error">("idle");

  const handleFoundingSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fmEmail.trim() || !fmName.trim()) return;
    setFmState("loading");
    const { error } = await supabase
      .from("founding_members")
      .insert({ name: fmName.trim(), email: fmEmail.trim().toLowerCase() });
    setFmState(error ? "error" : "done");
  };

  const aiCrew = [
    {
      icon: Bot,
      title: "AI Agent Crew",
      text:
        "Smart assistants that help your business answer customers, organize work, and automate daily tasks."
    },
    {
      icon: Zap,
      title: "Automation Waves",
      text:
        "Connect your systems and remove repetitive work with intelligent automation."
    },
    {
      icon: Users,
      title: "Lead Catcher",
      text:
        "Capture opportunities, follow up faster, and keep customers moving forward."
    },
    {
      icon: BarChart3,
      title: "Growth Navigator",
      text:
        "Turn your business information into smarter decisions."
    }
  ];

  const waves = [
    {
      name: "Free Wave",
      text: "Explore AI tools and start your journey."
    },
    {
      name: "Bronze Wave",
      text: "Build your first automation systems."
    },
    {
      name: "Big Kahuna",
      text: "Advanced AI solutions for growing businesses."
    },
    {
      name: "Tsunami Takeover",
      text:
        "Complete AI transformation for serious growth."
    }
  ];

  return (
    <div
      className="
        relative
        min-h-screen
        overflow-x-hidden
        bg-slate-950
        text-white
      "
      style={{
        backgroundImage: 'linear-gradient(rgba(2,12,30,0.9), rgba(2,12,30,0.95)), url("/images/Members-bg.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <OceanBackground />
      <SunriseGlow />
      <BioluminescentParticles />
      <Navbar />

      {/* ── LAUNCH DAY COUNTDOWN BANNER ─────────────────────────────── */}
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative z-50 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-400 text-slate-950"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-black text-sm uppercase tracking-widest">
            <Rocket size={16} className="animate-bounce" />
            {countdown.done
              ? "🎉 We Are LIVE — Welcome to Ocean Tide Drop AI SURFER!"
              : "🚀 WE LAUNCH TONIGHT — Founding Member spots are limited!"}
          </div>
          {!countdown.done && (
            <div className="flex items-center gap-1 font-black text-lg tabular-nums">
              <span className="bg-slate-950/20 rounded-lg px-2 py-0.5">{pad(countdown.h)}h</span>
              <span className="opacity-60">:</span>
              <span className="bg-slate-950/20 rounded-lg px-2 py-0.5">{pad(countdown.m)}m</span>
              <span className="opacity-60">:</span>
              <span className="bg-slate-950/20 rounded-lg px-2 py-0.5">{pad(countdown.s)}s</span>
            </div>
          )}
          <a
            href="#founding-member"
            className="text-xs font-black uppercase tracking-widest underline hover:no-underline whitespace-nowrap"
          >
            Claim Your Spot →
          </a>
        </div>
      </motion.div>

      {/* HERO */}
      <section
        className="
          relative
          min-h-screen
          flex
          items-center
          overflow-hidden
        "
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(2,12,30,.55),
              rgba(2,12,30,.90)
            ),
            url(${homepageConcept})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <motion.div
          initial={{
            opacity:0,
            y:40
          }}
          animate={{
            opacity:1,
            y:0
          }}
          transition={{
            duration:1
          }}
          className="
            relative
            z-10
            max-w-6xl
            mx-auto
            px-6
            py-32
          "
        >
          <img
            src="/ocean_tide_logo.png"
            alt="Ocean Tide Drop AI SURFER"
            className="w-44 mb-8"
          />

          <h1
            className="
              text-5xl
              md:text-7xl
              font-black
              leading-tight
            "
          >
            Helping Businesses
            <span className="block text-cyan-300">
              Catch The AI Wave
            </span>
          </h1>

          <p
            className="
              mt-8
              max-w-2xl
              text-xl
              text-slate-200
            "
          >
            Ocean Tide Drop AI SURFER builds AI agents,
            automation systems, and intelligent tools that
            help businesses save time, capture leads,
            and grow.
          </p>

          <div
            className="
              mt-10
              flex
              flex-wrap
              gap-5
            "
          >
            <Link
              to="/wave-check"
              className="
                rounded-full
                bg-cyan-400
                px-8
                py-4
                text-slate-950
                font-bold
                flex
                items-center
                gap-2
                hover:scale-105
                transition
              "
            >
              Get My Free AI Wave Check™
              <ArrowRight size={20}/>
            </Link>

            <Link
              to="/members"
              className="
                rounded-full
                bg-white/10
                border
                border-cyan-300/40
                px-8
                py-4
                text-cyan-200
                font-bold
                flex
                items-center
                gap-2
                hover:bg-cyan-300/20
                hover:scale-105
                transition
              "
            >
              🌊 Members Area
              <ArrowRight size={20}/>
            </Link>

            <a
              href="#solutions"
              className="
                rounded-full
                border
                border-white/40
                px-8
                py-4
                font-bold
                hover:bg-white/10
                transition
              "
            >
              Explore AI Solutions
            </a>

          </div>

        </motion.div>

        <motion.img
          src={cyberWave}
          alt="AI ocean wave"
          animate={{
            y:[0,-20,0]
          }}
          transition={{
            duration:6,
            repeat:Infinity
          }}
          className="
            absolute
            bottom-0
            right-0
            w-[500px]
            opacity-40
            pointer-events-none
          "
        />
      </section>

      {/* AI CREW */}
      <section
        id="solutions"
        className="
          relative
          z-10
          py-24
          px-6
          bg-slate-900/90
        "
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Waves
              className="
                mx-auto
                mb-4
                text-cyan-300
              "
              size={45}
            />

            <h2
              className="
                text-4xl
                font-bold
              "
            >
              Meet Your AI Surf Crew
            </h2>

            <p className="mt-4 text-slate-300">
              Powerful AI systems designed to help your business move faster.
            </p>

          </div>

          <div
            className="
              grid
              md:grid-cols-2
              lg:grid-cols-4
              gap-6
            "
          >
            {aiCrew.map((item)=>{
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  whileHover={{
                    y:-12,
                    scale:1.03
                  }}
                  transition={{
                    duration:.3
                  }}
                  className="
                    group
                    rounded-3xl
                    bg-white/10
                    backdrop-blur-xl
                    p-6
                    border
                    border-cyan-300/20
                    transition-all
                    duration-500
                    hover:border-cyan-300/50
                  "
                >
                  <Icon
                    className="
                      text-cyan-300
                      mb-5
                    "
                    size={38}
                  />

                  <h3
                    className="
                      text-xl
                      font-bold
                      mb-3
                    "
                  >
                    {item.title}
                  </h3>

                  <p className="text-slate-300">
                    {item.text}
                  </p>

                </motion.div>
              );
            })}
          </div>

        </div>
      </section>

      {/* MEMBERSHIP */}
      <section
        className="
          relative
          z-10
          py-24
          px-6
          bg-gradient-to-b
          from-slate-900
          to-cyan-950
        "
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className="
              text-center
              text-4xl
              font-bold
              mb-14
            "
          >
            Choose Your Wave
          </h2>

          <div
            className="
              grid
              md:grid-cols-2
              lg:grid-cols-4
              gap-6
            "
          >
            {waves.map((wave)=>(
              <motion.div
                key={wave.name}
                whileHover={{
                  y:-10,
                  scale:1.03
                }}
                transition={{
                  duration:.3
                }}
                className="
                  rounded-3xl
                  bg-white/10
                  backdrop-blur-xl
                  p-7
                  border
                  border-cyan-300/20
                  hover:border-cyan-300/50
                  transition
                "
              >
                <h3
                  className="
                    text-2xl
                    font-bold
                    text-cyan-300
                  "
                >
                  {wave.name}
                </h3>

                <p
                  className="
                    mt-4
                    text-slate-200
                  "
                >
                  {wave.text}
                </p>

                <Link
                  to="/members"
                  className="
                    inline-block
                    mt-6
                    text-cyan-200
                    font-bold
                    hover:text-cyan-300
                  "
                >
                  Ride this wave →
                </Link>

              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section
        className="
          relative
          z-10
          py-24
          px-6
          text-center
        "
      >
        <motion.div
          initial={{
            opacity:0,
            y:30
          }}
          whileInView={{
            opacity:1,
            y:0
          }}
          transition={{
            duration:.8
          }}
          viewport={{
            once:true
          }}
        >
          <h2
            className="
              text-5xl
              font-bold
            "
          >
            Ready To Ride The Next Wave?
          </h2>

          <p
            className="
              mt-6
              text-xl
              text-slate-300
              max-w-2xl
              mx-auto
            "
          >
            Join Ocean Tide Drop AI SURFER and bring AI power to your business.
          </p>

          <Link
            to="/members"
            className="
              inline-flex
              mt-10
              rounded-full
              bg-cyan-400
              px-10
              py-5
              text-slate-950
              font-bold
              hover:scale-105
              transition
            "
          >
            Enter Members Area 🌊
          </Link>

        </motion.div>
      </section>

      {/* Chat widget (dd Agent) */}
      <ChatAgent />

    </div>
  );
}
