import { InView } from "@/components/motion/InView";
import { SectionHead } from "@/components/sections/SectionHead";
import { startups } from "@/lib/site-data";

/**
 * 02 — what you get.
 *
 * klinn runs a rail of named placements here. Axiom has no placements it can
 * name yet, so the rail is the network itself — the roster from
 * lib/site-data.ts, which is true today — rather than invented people. When
 * real placements exist they drop into the same card shape.
 *
 * The rail is duplicated in the markup so the loop point is exactly -50%; the
 * duplicate is aria-hidden so a screen reader hears the network once. It
 * pauses on hover — a list of real companies you cannot stop to read is
 * decoration.
 */

const CLAIMS = [
  {
    title: "warm intros, not applications",
    body: "you show up as someone worth meeting, not a submission id.",
  },
  {
    title: "real work, early",
    body: "the kind of team where what you build actually shows.",
  },
] as const;

function Rail({ hidden }: { hidden?: boolean }) {
  return (
    <div className="flex flex-col gap-3 pb-3" aria-hidden={hidden || undefined}>
      {startups.map((startup) => (
        <div
          key={`${startup.name}-${hidden ? "dup" : "lead"}`}
          className="flex items-center gap-3 rounded-[12px] bg-white px-3 py-3 shadow-[0_0_0_1px_var(--color-border-faint),0_1px_2px_rgba(4,36,16,0.04)]"
        >
          <span
            aria-hidden="true"
            className="grid h-5 w-5 shrink-0 place-items-center rounded-[5px] bg-accent/10 text-[10px] font-semibold text-accent"
          >
            {startup.name[0]}
          </span>
          <span className="min-w-0">
            <span className="block text-[14px] text-loud">
              {startup.name.toLowerCase()}
            </span>
            <span className="block truncate text-[12px] text-muted">
              {startup.yc ? `${startup.yc} · ` : ""}
              {startup.meta.toLowerCase()}
            </span>
          </span>
        </div>
      ))}
    </div>
  );
}

function BrowserWindow() {
  return (
    <div className="overflow-hidden rounded-[16px] bg-white shadow-[0_0_0_1px_var(--color-border-faint),0_8px_24px_-8px_rgba(4,36,16,0.12)]">
      <div className="flex items-center justify-between px-5 py-3.5">
        <span className="flex gap-1">
          <span className="h-[7px] w-[7px] rounded-full bg-[#ff5f57]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#febc2e]" />
          <span className="h-[7px] w-[7px] rounded-full bg-[#28c840]" />
        </span>
        <span className="flex items-center gap-1 rounded-[6px] bg-paper px-2 py-0.5 text-[11px] text-muted">
          <svg aria-hidden="true" viewBox="0 0 12 12" className="h-2.5 w-2.5" fill="none" stroke="currentColor" strokeWidth="1.3">
            <rect x="2.5" y="5.5" width="7" height="5" rx="1" />
            <path d="M4 5.5V4a2 2 0 1 1 4 0v1.5" />
          </svg>
          axiomapply.com
        </span>
        <span className="text-[11px] text-muted">open</span>
      </div>

      <div className="relative px-5 pb-6">
        <div className="h-3.5 w-3/4 rounded-[4px] bg-loud/[0.04]" />
        <div className="mt-3 grid grid-cols-[5rem_1fr] gap-2.5">
          <div className="h-36 rounded-[6px] bg-loud/[0.03]" />
          <div className="flex flex-col gap-2.5">
            <div className="h-8 rounded-[6px] bg-loud/[0.04]" />
            <div className="h-8 rounded-[6px] bg-loud/[0.04]" />
            <div className="h-8 rounded-[6px] bg-loud/[0.04]" />
          </div>
        </div>
        {/* The live dot — klinn's one piece of signal colour. */}
        <span className="absolute top-0 left-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1 place-items-center rounded-[12px] bg-white shadow-[0_4px_16px_rgba(4,36,16,0.08)]">
          <span className="ax-pulse h-2 w-2 rounded-full bg-signal" />
        </span>
        <p className="mt-5 text-[11px] text-muted">remote · part-time · real work</p>
      </div>
    </div>
  );
}

export function WhatYouGetSection() {
  return (
    <section id="what-you-get" className="py-24 sm:py-32">
      <SectionHead
        index="02"
        label="what you get"
        icon="eye"
        title="seen by the person who hires"
        subcopy="startups look at people, not a queue."
      />

      <InView delay={200} className="mx-auto mt-6 w-full max-w-[49.5rem] px-6">
        <a href="#how-it-works" className="btn-gloss-light btn-sm">
          how it works
        </a>
      </InView>

      <div className="mx-auto mt-14 grid w-full max-w-[49.5rem] gap-10 px-6 md:grid-cols-2 md:gap-12">
        <InView className="group relative h-[17rem] overflow-hidden">
          <div className="ax-marquee-y flex flex-col group-hover:[animation-play-state:paused]">
            <Rail />
            <Rail hidden />
          </div>
          {/* Fades into the page top and bottom so the loop seam never lands
              on a hard line. */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(var(--color-paper) 0%, transparent 22%, transparent 78%, var(--color-paper) 100%)",
            }}
          />
        </InView>

        <InView delay={120} className="md:pt-2">
          <BrowserWindow />
        </InView>

        {CLAIMS.map((claim, index) => (
          <InView key={claim.title} delay={index * 90}>
            <h3 className="font-display text-[24px] leading-[28px] tracking-[-0.3px] text-loud">
              {claim.title}
            </h3>
            <p className="mt-2 max-w-[36ch] text-body-default text-loud/85">
              {claim.body}
            </p>
          </InView>
        ))}
      </div>
    </section>
  );
}
