import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";
import { startups } from "@/lib/site-data";

/**
 * 04 — the startups.
 *
 * Names, not logos: Axiom has permission to say who it places people into and
 * does not have a logo pack, and a grid of wordmarks we drew ourselves would
 * be a worse lie than type set well.
 *
 * The ring is the one purely decorative thing in the stack. It earns its place
 * by being slow — ninety seconds a turn reads as drift, and anything faster
 * would pull the eye off the roster it sits beside.
 */

const RING_TEXT = "MATCHED BY HAND · AXIOM PATHWAYS · ";

function DriftRing() {
  const characters = RING_TEXT.split("");
  const step = 360 / characters.length;

  return (
    <div
      aria-hidden="true"
      className="ax-ring-spin relative hidden h-[13rem] w-[13rem] shrink-0 lg:block"
    >
      {characters.map((character, index) => (
        <span
          key={`${character}-${index}`}
          className="absolute top-1/2 left-1/2 font-mono text-[0.72rem] tracking-[0.1em] text-faint"
          style={{
            transform: `rotate(${index * step}deg) translateY(-6.1rem)`,
            transformOrigin: "0 0",
          }}
        >
          {character}
        </span>
      ))}
      <span className="absolute inset-0 grid place-items-center">
        <span className="h-2 w-2 rounded-full bg-forest" />
      </span>
    </div>
  );
}

export function StartupsSection() {
  return (
    <section className="bg-paper py-28 sm:py-40">
      <SectionHead
        index="04"
        label="the startups"
        title="Who you get in front of"
        subcopy="Early teams hiring right now — small enough that what you build is visible, and close enough that the founder still does the hiring."
      />

      <div className="mx-auto mt-16 flex w-full max-w-[68rem] items-center gap-12 px-6">
        <div className="grid flex-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {startups.map((startup, index) => (
            <InView
              key={startup.name}
              delay={index * 60}
              className="rounded-[18px] bg-card p-5 shadow-[0_1px_3px_rgba(21,21,15,0.05)] transition-shadow duration-300 hover:shadow-float"
            >
              <p className="flex items-baseline gap-2">
                <span className="text-[1.05rem] font-medium text-ink">
                  {startup.name}
                </span>
                {startup.yc ? (
                  <span className="font-mono text-[0.68rem] tracking-[0.08em] text-forest uppercase">
                    {startup.yc}
                  </span>
                ) : null}
              </p>
              <p className="mt-1.5 text-[0.85rem] leading-[1.45] text-muted">
                {startup.meta}
              </p>
            </InView>
          ))}
        </div>

        <DriftRing />
      </div>

      <InView
        delay={200}
        className="mx-auto mt-12 flex w-full max-w-[68rem] px-6"
      >
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
