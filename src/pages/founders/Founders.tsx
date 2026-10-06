import React, { useState } from "react";
import PageWrapper from "../../components/PageWrapper";
import { motion } from "motion/react";
import { Heart, Sparkles, Waves, Users, PawPrint, Camera, Sun } from "lucide-react";

type PhotoCardProps = {
  src: string;
  alt: string;
  eyebrow: string;
  title: string;
  caption: string;
  className?: string;
};

function PhotoCard({ src, alt, eyebrow, title, caption, className = "" }: PhotoCardProps) {
  const [failed, setFailed] = useState(false);

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      className={`overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl ${className}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-cyan-950 via-sky-900 to-orange-200/30">
        {!failed ? (
          <img
            src={src}
            alt={alt}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setFailed(true)}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-8 text-center">
            <Camera className="h-12 w-12 text-cyan-300/70" />
            <p className="text-sm font-black uppercase tracking-[0.22em] text-cyan-100">{title}</p>
            <p className="max-w-sm text-sm text-cyan-100/60">Real family photo slot ready for the approved image.</p>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#03101d] to-transparent" />
      </div>

      <div className="p-7 md:p-8">
        <span className="text-[10px] font-black uppercase tracking-[0.35em] text-cyan-300">{eyebrow}</span>
        <h3 className="mt-2 text-2xl font-black tracking-tight text-white md:text-3xl">{title}</h3>
        <p className="mt-3 leading-relaxed text-cyan-100/70">{caption}</p>
      </div>
    </motion.article>
  );
}

const family = ["Shannon", "Sterling", "Victoria", "Nicole", "Sabryn", "Levi", "David"];
const crew = [
  {
    name: "Sailor Ann",
    note: "Black Lab • steady, loyal, always ready for the next adventure",
    accent: "from-sky-400 to-cyan-300",
  },
  {
    name: "Stormy Gray",
    note: "Black-and-white, long-haired guardian with the flowing tail",
    accent: "from-slate-300 to-cyan-300",
  },
  {
    name: "Sky Marlin",
    note: "Small tan spark with ears up and plenty of personality",
    accent: "from-amber-300 to-orange-300",
  },
];

export default function Founders() {
  return (
    <PageWrapper maxWidth="max-w-7xl" showHero={false}>
      <div className="relative w-full overflow-hidden px-4 py-8 text-white md:px-8 md:py-12">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_28%),linear-gradient(180deg,#03101d_0%,#062b45_45%,#07111d_100%)]" />

        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-auto mb-20 max-w-5xl text-center md:mb-28"
        >
          <div className="mb-6 flex items-center justify-center gap-3">
            <div className="h-px w-12 bg-cyan-400/30" />
            <Waves className="h-6 w-6 text-cyan-300" />
            <span className="text-[10px] font-black uppercase tracking-[0.45em] text-cyan-200/70">Ocean Tide Drop AI SURFER</span>
            <div className="h-px w-12 bg-cyan-400/30" />
          </div>

          <h1 className="text-5xl font-black tracking-tighter md:text-7xl lg:text-8xl">
            The Family Behind <span className="bg-gradient-to-r from-cyan-300 via-sky-200 to-amber-200 bg-clip-text text-transparent">the Wave.</span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-cyan-50/70 md:text-xl">
            No invented faces. No stock-family stand-ins. This page is built around the real people and dogs that make up the Ocean Tide Drop story.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-2">
            {family.map((name) => (
              <span
                key={name}
                className="rounded-full border border-cyan-300/20 bg-white/5 px-4 py-2 text-xs font-black uppercase tracking-[0.2em] text-cyan-100/80"
              >
                {name}
              </span>
            ))}
          </div>
        </motion.section>

        <section className="mb-24 grid gap-8 lg:grid-cols-2">
          <PhotoCard
            src="/images/founders/shannon-victoria-paddleboards.png"
            alt="Shannon Cahoon and Victoria on paddleboards"
            eyebrow="Founder Current"
            title="Shannon Cahoon + Victoria"
            caption="A real-photo anchor for the page. Keep the likenesses true, then let the ocean styling, motion, and AI Surfer graphics create the character around them."
          />

          <PhotoCard
            src="/images/founders/family-current.jpg"
            alt="Sterling, Victoria, Nicole, Sabryn, Levi and David"
            eyebrow="Family Current"
            title="Sterling • Victoria • Nicole • Sabryn • Levi • David"
            caption="The family stays recognizable. The design gets the cinematic beach treatment around the photo instead of replacing anyone with an AI-generated stranger."
          />
        </section>

        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-24 rounded-[2.25rem] border border-cyan-300/15 bg-gradient-to-br from-cyan-500/10 via-white/5 to-amber-300/10 p-7 shadow-2xl md:p-12"
        >
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <div className="mb-5 flex items-center gap-3 text-cyan-200">
                <Sun className="h-5 w-5" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Founder & Builder</span>
              </div>

              <h2 className="text-4xl font-black tracking-tight md:text-6xl">Shannon Cahoon</h2>
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-cyan-50/75">
                Founder of Ocean Tide Drop AI SURFER. The brand combines practical AI, automation, lead systems, visibility, and a strong ocean identity built to make technology feel useful instead of overwhelming.
              </p>

              <div className="mt-7 grid gap-3 sm:grid-cols-3">
                {[
                  ["Build", "Turn ideas into working systems"],
                  ["Automate", "Reduce repetitive business work"],
                  ["Grow", "Create more visibility and opportunity"],
                ].map(([title, copy]) => (
                  <div key={title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                    <p className="font-black text-white">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-cyan-50/55">{copy}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/20 p-7 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-amber-200" />
              <p className="mt-4 text-xs font-black uppercase tracking-[0.3em] text-cyan-100/60">Ride the Wave</p>
              <p className="mt-3 text-3xl font-black">Build. Automate. Grow.</p>
            </div>
          </div>
        </motion.section>

        <section className="mb-24">
          <div className="mb-10 text-center">
            <PawPrint className="mx-auto h-8 w-8 text-cyan-300" />
            <h2 className="mt-4 text-4xl font-black tracking-tight md:text-6xl">The Ocean Crew.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-cyan-50/65">Sailor Ann, Stormy Gray, and Sky Marlin belong on the page as themselves, not as lookalike stand-ins.</p>
          </div>

          <PhotoCard
            src="/images/founders/ocean-crew.png"
            alt="Sailor Ann, Stormy Gray, and Sky Marlin"
            eyebrow="Three Hearts • One Adventure"
            title="Sailor Ann • Stormy Gray • Sky Marlin"
            caption="This slot is for the approved real-dog artwork or photo. Their markings, size, ears, coat, and expressions should stay faithful to the real crew."
            className="mx-auto max-w-5xl"
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {crew.map((dog) => (
              <motion.div
                key={dog.name}
                whileHover={{ y: -4 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6"
              >
                <div className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${dog.accent}`} />
                <h3 className="text-xl font-black">{dog.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cyan-50/60">{dog.note}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-white/5 p-8 text-center shadow-2xl md:p-14"
        >
          <Users className="mx-auto h-9 w-9 text-cyan-300" />
          <h2 className="mt-5 text-4xl font-black tracking-tight md:text-5xl">The Real Story Is the Brand Story.</h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-cyan-50/70">
            Ocean Tide Drop AI SURFER can still feel cinematic, playful, beachy, and larger than life without changing the people who made it. Real photos first. AI Surfer world-building around them.
          </p>
          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-5 py-3 text-sm font-black text-cyan-100">
            <Heart className="h-4 w-4" />
            Built by the ocean. Powered by AI. Driven by purpose.
          </div>
        </motion.section>
      </div>
    </PageWrapper>
  );
}
