import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "How to pick" };

const PRINCIPLES = [
  {
    n: "01",
    title: "Hire the loop, not the resume",
    body: "The best young builders show a repeatable loop: try → ship → measure → adjust. Ask what they shipped last month, not where they go to school.",
  },
  {
    n: "02",
    title: "Scope one shippable thing",
    body: "Great placements start with a two-week deliverable, not a job description. One feature, one growth experiment, one pipeline — something that either ships or doesn't.",
  },
  {
    n: "03",
    title: "Passion beats polish",
    body: "A scrappy deployed project beats a perfect deck. We screen for people already building in your space on their own time.",
  },
  {
    n: "04",
    title: "Feedback fast, trust early",
    body: "Give real work and a daily feedback loop. The builders we place expect ownership — that's why they came to a startup instead of a big-tech pipeline.",
  },
] as const;

export default function HowToPickPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Playbook</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            How to pick a builder who ships.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[54ch] text-muted">
            What we&apos;ve learned matching young talent into real startups —
            four principles that separate great placements from dead ones.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-col gap-4">
        {PRINCIPLES.map((p, i) => (
          <Reveal key={p.n} delay={0.16 + i * 0.06}>
            <GlassPanel specular className="flex gap-5 p-7">
              <span className="font-mono text-[0.78rem] tracking-[0.08em] text-forest">
                {p.n}
              </span>
              <div>
                <h2 className="text-[1.15rem] font-semibold tracking-tight text-ink">
                  {p.title}
                </h2>
                <p className="mt-1.5 leading-relaxed text-muted">{p.body}</p>
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.44}>
        <GlassPanel variant="dark" specular className="flex flex-wrap items-center justify-between gap-5 p-7">
          <p className="max-w-[38ch] text-[1.02rem] font-medium leading-relaxed">
            We do this screening for you — that&apos;s the whole point.
          </p>
          <Link
            href="/startup/demo-call"
            className="rounded-full bg-night-text px-6 py-3 text-[0.9rem] font-medium text-night transition-transform duration-300 hover:-translate-y-0.5"
          >
            Book the demo call →
          </Link>
        </GlassPanel>
      </Reveal>
    </main>
  );
}
