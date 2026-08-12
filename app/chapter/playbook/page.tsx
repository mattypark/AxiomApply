import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";

export const metadata = { title: "Chapter playbook" };

const PRINCIPLES = [
  {
    n: "01",
    title: "Ask ten people by name",
    body: "Posters get you a room of six strangers who never come back. Ten direct asks — people you already know, chosen because they build things — gets you a room that has a reason to return. Do this before you book anything.",
  },
  {
    n: "02",
    title: "Make the first meeting produce something",
    body: "Not an intro slideshow. Everyone leaves with one thing they made or one thing they signed up to make by next time. A chapter that ships in week one has a reason to exist in week ten.",
  },
  {
    n: "03",
    title: "Same day, same time, no exceptions",
    body: "The single strongest predictor of a chapter surviving the year is a meeting people do not have to think about. Move it once and attendance halves.",
  },
  {
    n: "04",
    title: "Bring one outsider in early",
    body: "A founder, an alum, anyone doing the real version of the thing. It changes what members think the club is for. Name the person you want and we will try to make the introduction.",
  },
  {
    n: "05",
    title: "Pick your successor in the first term",
    body: "Chapters die at graduation, not at founding. Whoever runs the second year should be running parts of the first one.",
  },
] as const;

export default function ChapterPlaybookPage() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Playbook</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            How to run a first meeting people come back from.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[54ch] text-muted">
            Five things that separate chapters still running in spring from the
            ones that quietly stopped meeting in November.
          </p>
        </Reveal>
      </div>

      <div className="flex flex-col gap-4">
        {PRINCIPLES.map((principle, index) => (
          <Reveal key={principle.n} delay={0.16 + index * 0.06}>
            <GlassPanel specular className="flex gap-5 p-7">
              <span className="font-mono text-[0.78rem] tracking-[0.08em] text-forest">
                {principle.n}
              </span>
              <div>
                <h2 className="text-[1.15rem] font-semibold tracking-tight text-ink">
                  {principle.title}
                </h2>
                <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">
                  {principle.body}
                </p>
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.5}>
        <p className="text-[0.85rem] text-muted">
          Stuck on one of these?{" "}
          <a
            href="mailto:matthew@axiompathways.org?subject=Chapter%20question"
            className="font-medium text-forest hover:text-forest-deep"
          >
            Email us
          </a>{" "}
          — or head back to{" "}
          <Link href="/chapter/home" className="font-medium text-forest">
            Chapter HQ →
          </Link>
        </p>
      </Reveal>
    </main>
  );
}
