import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";
import { startups } from "@/lib/site-data";

/**
 * 02 — what you get.
 *
 * A vertical rail of the actual network beside the two claims that matter.
 * The rail is the roster from lib/site-data.ts rather than a set of logos we
 * do not have permission to draw, and it is duplicated in the markup so the
 * loop point can be exactly -50%. The duplicate is aria-hidden: a screen
 * reader should hear the network once.
 *
 * The rail pauses on hover — it is a list of real companies, and a list you
 * cannot stop to read is decoration.
 */

const CLAIMS = [
  {
    title: "Warm intros, not applications",
    body: "You arrive as someone worth meeting, not as a submission id in a queue.",
  },
  {
    title: "Real work, early",
    body: "Teams small enough that what you build is visible, and the founder still does the hiring.",
  },
] as const;

function Rail({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex flex-col gap-3" aria-hidden={hidden || undefined}>
      {startups.map((startup) => (
        <div
          key={`${startup.name}-${hidden ? "dup" : "lead"}`}
          className="rounded-[16px] bg-card px-5 py-4 shadow-[0_1px_3px_rgba(21,21,15,0.05)]"
        >
          <p className="flex items-baseline gap-2.5">
            <span className="text-[1.05rem] font-medium text-ink">
              {startup.name}
            </span>
            {startup.yc ? (
              <span className="font-mono text-[0.68rem] tracking-[0.08em] text-forest uppercase">
                {startup.yc}
              </span>
            ) : null}
          </p>
          <p className="mt-1 text-[0.85rem] text-muted">{startup.meta}</p>
        </div>
      ))}
    </div>
  );
}

export function WhatYouGetSection() {
  return (
    <section className="bg-paper py-28 sm:py-40">
      <SectionHead
        index="02"
        label="what you get"
        title="Seen by the person who decides"
        subcopy="Startups in the network look at people, not at a queue. The list below is the whole thing — it grows as fast as two people can grow it."
      />

      <div className="mx-auto mt-16 grid w-full max-w-[68rem] gap-12 px-6 lg:grid-cols-2 lg:items-center">
        <InView className="group relative h-[26rem] overflow-hidden">
          <div className="ax-marquee-y flex flex-col gap-3 group-hover:[animation-play-state:paused]">
            <Rail />
            <Rail hidden />
          </div>
          {/* The rail fades into the page rather than stopping at an edge, so
              the loop seam never lands on a hard line. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(var(--color-paper) 0%, transparent 18%, transparent 82%, var(--color-paper) 100%)",
            }}
          />
        </InView>

        <div className="flex flex-col gap-10">
          {CLAIMS.map((claim, index) => (
            <InView key={claim.title} delay={index * 90}>
              <h3 className="font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-[1.15] text-ink">
                {claim.title}
              </h3>
              <p className="mt-3 max-w-[38ch] text-[1.0625rem] leading-[1.55] text-muted">
                {claim.body}
              </p>
            </InView>
          ))}

          <InView delay={200}>
            <Link
              href="/onboarding?side=intern"
              className="ax-shine inline-flex items-center rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Apply to the network
            </Link>
          </InView>
        </div>
      </div>
    </section>
  );
}
