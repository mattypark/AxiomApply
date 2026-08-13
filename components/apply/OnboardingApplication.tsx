"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import { ChapterApplication } from "@/components/apply/ChapterApplication";
import type { ApplyPrefill } from "@/components/apply/ApplyEngine";
import type { Side } from "@/lib/apply-sides";

/**
 * /onboarding — the second entry point into the apply engine.
 *
 * No auth up front: Get started lands here signed-out, the account is created
 * later inside the application's own gate (name + email + Google). The only
 * job of this screen is the side pick.
 *
 * Three sides, so three full-height columns split by two vertical hairlines.
 * Hovering one fills it in that application's own surface colour, runs the
 * assembling lines across it and outlines it in forest; choosing one animates
 * the whole picker out and mounts that application in place.
 *
 * Below `md` the columns stack into three bands carrying the same copy.
 */

type Column = {
  side: Side;
  kicker: string;
  label: [string, string];
  blurb: string;
  /** Which edge the assembling lines sweep in from. */
  from: "left" | "right";
  /** Fill on hover — each application's own surface. Null keeps it white. */
  fill: string | null;
};

const COLUMNS: Column[] = [
  {
    side: "intern",
    kicker: "Student",
    label: ["Looking for", "an internship."],
    blurb:
      "The full application. It saves as you type, a person reads it, and you hear back within 14 days either way. Selected on what you have shipped, not GPA.",
    from: "right",
    fill: null,
  },
  {
    side: "startup",
    kicker: "Startup",
    label: ["Hiring", "interns."],
    blurb:
      "Tell us the shape of the work and we match by hand — 2–4 candidates, not a firehose of 200. Every startup is verified by a person before the dashboard unlocks.",
    from: "left",
    fill: "#0e0f0d",
  },
  {
    side: "chapter",
    kicker: "Chapter",
    label: ["Start a chapter", "at your school."],
    blurb:
      "Bring Axiom somewhere it has never been. Approved one at a time, by hand — and it does not use up either of the other two.",
    from: "left",
    fill: "#2e302c",
  },
];

export function OnboardingApplication({
  prefill,
  initialSide,
}: {
  prefill?: ApplyPrefill;
  /** Preselects a side — set when OAuth returns to `?side=...`. */
  initialSide?: Side;
}) {
  const reduce = useReducedMotion();
  const [side, setSide] = useState<Side | null>(initialSide ?? null);

  return (
    <AnimatePresence mode="wait">
      {side === null ? (
        <motion.div
          key="picker"
          initial={false}
          exit={
            reduce
              ? { opacity: 0 }
              : { opacity: 0, scale: 0.985, filter: "blur(10px)" }
          }
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <Picker onPick={setSide} />
        </motion.div>
      ) : (
        <motion.div
          key={side}
          initial={
            reduce ? { opacity: 0 } : { opacity: 0, y: 26, filter: "blur(8px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          {side === "intern" ? (
            <InternApplication prefill={prefill} backHref="/" />
          ) : side === "startup" ? (
            <StartupApplication prefill={prefill} backHref="/" />
          ) : (
            <ChapterApplication prefill={prefill} backHref="/" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* the triangle picker                                                 */
/* ------------------------------------------------------------------ */

/** How many lines assemble across a wedge. */
const LINE_COUNT = 14;

/**
 * The assembling-lines hover, the Iron-Man-nanoparticle read: thin diagonal
 * rules materialise one after another from a top corner and sweep across the
 * column.
 *
 * Pure CSS: each line owns a transition-delay, so hovering runs them in
 * sequence and un-hovering runs the sequence backwards. Only opacity and
 * transform animate, so it all stays on the compositor.
 */
function HoverLines({ from, dark }: { from: "left" | "right"; dark?: boolean }) {
  // The button box IS the column now, so a plain top-corner origin works.
  const mask =
    from === "right"
      ? "radial-gradient(120% 120% at 100% 0%, #000 25%, transparent 72%)"
      : "radial-gradient(120% 120% at 0% 0%, #000 25%, transparent 72%)";

  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {Array.from({ length: LINE_COUNT }, (_, index) => (
        // Tailwind's scale utilities compose into `transform`, which would
        // clash with the per-line rotate — so the whole state lives in CSS
        // (.fx-line in globals.css) driven by these custom properties.
        <span
          key={index}
          className="fx-line"
          style={{
            top: `${6 + index * 6.4}%`,
            [from === "right" ? "right" : "left"]: "-20%",
            ["--fx-origin" as string]:
              from === "right" ? "right center" : "left center",
            ["--fx-rot" as string]: from === "right" ? "-14deg" : "14deg",
            ["--fx-line-color" as string]: dark
              ? "rgba(168,213,179,0.55)"
              : "rgba(47,107,61,0.5)",
            transitionDelay: `${index * 38}ms`,
          }}
        />
      ))}
    </span>
  );
}

function Picker({ onPick }: { onPick: (side: Side) => void }) {
  return (
    <main className="flex min-h-dvh flex-col bg-white">
      <header
        className="relative px-6 pt-20 pb-6 sm:px-10 sm:pt-24"
        style={{ borderBottom: "1px solid var(--lines)" }}
      >
        <Link
          href="/"
          className="absolute top-8 left-6 font-mono text-[0.72rem] tracking-[0.16em] text-muted uppercase transition-colors duration-300 hover:text-ink sm:left-10"
        >
          ← Back
        </Link>

        <h1 className="text-center font-mono text-[0.78rem] tracking-[0.24em] text-muted uppercase">
          Which side are you on?
        </h1>
      </header>

      {/* Three columns split by two vertical hairlines. Under md they stack
          into bands, and the divider moves to the bottom edge. */}
      <div className="grid flex-1 md:grid-cols-3">
        {COLUMNS.map((column, index) => (
          <button
            key={column.side}
            type="button"
            onClick={() => onPick(column.side)}
            className={`group relative flex cursor-pointer flex-col justify-between gap-12 px-6 py-10 text-left outline-none transition-colors duration-500 sm:px-8 sm:py-12 ${
              index < COLUMNS.length - 1
                ? "border-b border-b-[var(--lines)] md:border-r md:border-r-[var(--lines)] md:border-b-0"
                : ""
            }`}
          >
            {/* fill — each application's own surface, on hover only */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ background: column.fill ?? "rgba(47,107,61,0.05)" }}
            />

            {/* forest outline on hover/focus — inset so the grid never shifts */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ boxShadow: "inset 0 0 0 2px var(--color-forest)" }}
            />

            <HoverLines from={column.from} dark={Boolean(column.fill)} />

            <span className="relative flex items-center justify-between">
              <span
                className={`font-mono text-[0.74rem] font-semibold tracking-[0.24em] uppercase transition-colors duration-300 ${
                  column.fill
                    ? "text-faint group-hover:text-[#a8d5b3]"
                    : "text-faint group-hover:text-forest"
                }`}
              >
                {column.kicker}
              </span>
              <span
                className={`font-mono text-[0.64rem] tracking-[0.16em] transition-colors duration-300 ${
                  column.fill ? "text-faint group-hover:text-[#8c8a82]" : "text-faint"
                }`}
              >
                0{index + 1}
              </span>
            </span>

            <span
              className={`relative block text-[clamp(1.7rem,3.1vw,2.9rem)] leading-[1.02] font-bold tracking-[-0.032em] transition-colors duration-400 ${
                column.fill
                  ? "text-ink group-hover:text-[#f2f0e9]"
                  : "text-ink group-hover:text-forest-deep"
              }`}
            >
              {column.label[0]}
              <br />
              {column.label[1]}
            </span>

            <span className="relative flex items-end justify-between gap-5">
              <span
                className={`max-w-[38ch] text-[0.88rem] leading-relaxed transition-colors duration-400 ${
                  column.fill
                    ? "text-muted group-hover:text-[#b0aea3]"
                    : "text-muted"
                }`}
              >
                {column.blurb}
              </span>
              <span
                aria-hidden
                className={`shrink-0 text-[1.3rem] transition-[color,transform] duration-400 group-hover:translate-x-1.5 group-hover:text-forest ${
                  column.fill ? "text-faint" : "text-faint"
                }`}
              >
                →
              </span>
            </span>
          </button>
        ))}
      </div>

    </main>
  );
}
