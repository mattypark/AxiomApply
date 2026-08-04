import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";

export type LegalSection = {
  heading: string;
  /** Each string renders as its own paragraph. */
  body: string[];
  /** Optional bulleted list rendered after the paragraphs. */
  list?: string[];
};

type Props = {
  title: string;
  /** Human-readable date, e.g. "August 3, 2026". */
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/**
 * Shared chrome for /privacy and /terms — back link, title, last-updated
 * stamp, and a readable measure. Both documents stay plain text so they can
 * be edited without touching layout.
 */
export function LegalDoc({ title, updated, intro, sections }: Props) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col px-5 py-10 sm:px-8">
      <Link
        href="/"
        className="w-fit text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
      >
        ← Back
      </Link>

      <Reveal className="mt-14">
        <span className="kicker">Axiom Pathways</span>
        <h1 className="mt-2 text-[clamp(2.2rem,6vw,3.4rem)] font-semibold tracking-tight text-ink">
          {title}
        </h1>
      </Reveal>

      <Reveal delay={0.08}>
        <p className="mt-3 font-mono text-[0.74rem] tracking-[0.1em] text-faint uppercase">
          Last updated {updated}
        </p>
        <p className="mt-5 max-w-[58ch] leading-relaxed text-muted">{intro}</p>
      </Reveal>

      <div className="mt-12 flex flex-col gap-4">
        {sections.map((section, i) => (
          <Reveal key={section.heading} delay={0.12 + i * 0.04}>
            <GlassPanel className="flex flex-col gap-3 p-7">
              <h2 className="text-[1.15rem] font-semibold tracking-tight text-ink">
                {section.heading}
              </h2>
              {section.body.map((paragraph) => (
                <p
                  key={paragraph.slice(0, 40)}
                  className="max-w-[62ch] text-[0.95rem] leading-relaxed text-muted"
                >
                  {paragraph}
                </p>
              ))}
              {section.list && (
                <ul className="mt-1 flex flex-col gap-2">
                  {section.list.map((item) => (
                    <li
                      key={item.slice(0, 40)}
                      className="max-w-[62ch] pl-4 text-[0.95rem] leading-relaxed text-muted before:-ml-4 before:inline-block before:w-4 before:text-forest before:content-['—']"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </GlassPanel>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.4}>
        <p className="mt-10 text-[0.85rem] text-muted">
          Questions about this document?{" "}
          <a
            href="mailto:matthew@axiompathways.org"
            className="font-medium text-forest transition-colors hover:text-forest-deep"
          >
            matthew@axiompathways.org
          </a>
        </p>
      </Reveal>
    </main>
  );
}
