import Image from "next/image";
import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";
import { startups } from "@/lib/site-data";

/**
 * 04 — the startups.
 *
 * A wall of white cards, logo over name. Four of the eight have a real logo
 * file; the rest draw a monogram in the brand green so the grid stays even
 * without anyone inventing a wordmark for a company that has not given us one.
 * Adding a PNG to /public/logos and naming it in lib/site-data.ts upgrades a
 * card with no change here.
 *
 * The ticker underneath is the proof line — one placement at a time, named.
 */

function Monogram({ name }: { name: string }) {
  // Two initials for multi-word names, one otherwise: "Quarter Life Crisis"
  // reads as QL, "Tally" as T.
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((word) => word[0])
    .join("");

  return (
    <span
      aria-hidden="true"
      className="grid h-12 w-12 place-items-center rounded-[14px] bg-forest/10 font-display text-[1.15rem] text-forest"
    >
      {initials}
    </span>
  );
}

export function StartupsSection() {
  return (
    <section className="py-28 sm:py-40">
      <SectionHead
        index="04"
        label="the startups"
        title="Who you get in front of"
        subcopy="Early teams hiring right now — small enough that what you build is visible, and close enough that the founder still does the hiring."
      />

      <div className="mx-auto mt-16 grid w-full max-w-[68rem] grid-cols-2 gap-4 px-6 sm:grid-cols-3 lg:grid-cols-4">
        {startups.map((startup, index) => (
          <InView
            key={startup.name}
            delay={index * 55}
            className="flex flex-col items-center gap-4 rounded-[20px] bg-card px-4 py-8 shadow-[0_1px_3px_rgba(4,26,12,0.06)] transition-shadow duration-300 hover:shadow-float"
          >
            {startup.logo ? (
              <Image
                src={startup.logo}
                alt={startup.name}
                width={96}
                height={96}
                className="h-12 w-12 object-contain"
              />
            ) : (
              <Monogram name={startup.name} />
            )}

            <span className="text-center text-[0.95rem] font-medium text-ink">
              {startup.name}
            </span>

            {startup.yc ? (
              <span className="-mt-2 font-mono text-[0.62rem] tracking-[0.08em] text-faint uppercase">
                {startup.yc}
              </span>
            ) : null}
          </InView>
        ))}
      </div>

      <InView
        delay={220}
        className="mx-auto mt-12 flex w-full max-w-[68rem] flex-wrap items-center justify-between gap-6 px-6"
      >
        <span className="inline-flex items-center gap-2.5 rounded-full bg-card px-4 py-2 shadow-[0_1px_3px_rgba(4,26,12,0.06)]">
          <span className="h-2 w-2 rounded-full bg-forest" />
          <span className="text-[0.9rem] text-muted">
            Introductions sent by hand, one at a time
          </span>
        </span>

        <Link
          href="/for-startups"
          className="text-[0.95rem] text-muted underline underline-offset-4 transition-colors duration-200 hover:text-ink"
        >
          Hiring an intern instead? →
        </Link>
      </InView>
    </section>
  );
}
