"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import type { ApplyPrefill } from "@/components/apply/ApplyEngine";

/**
 * /onboarding — the second entry point into the apply engine.
 *
 * No auth up front: Get started lands here signed-out, the account is created
 * later inside the application's own gate (name + email + Google). The only
 * job of this screen is the side pick.
 *
 * Layout is the fourmula T: a title band with a hairline under it, then a
 * vertical hairline splitting the viewport into two halves — HIRING on the
 * left, LOOKING on the right — each with oversized type and a description
 * pinned to the bottom. Hovering a half draws the forest outline; choosing one
 * animates the picker out and mounts that application in place.
 */

type Side = "intern" | "startup";

type Half = {
  side: Side;
  kicker: string;
  title: [string, string];
  description: string;
  /** The startup half runs dark, matching its application's night surface. */
  dark?: boolean;
};

const HALVES: Half[] = [
  {
    side: "intern",
    kicker: "Student",
    title: ["Looking for", "an internship."],
    description:
      "The full application. It saves as you type, a person reads it, and you hear back within 14 days either way. Selected on what you have shipped, not GPA.",
  },
  {
    side: "startup",
    kicker: "Startup",
    title: ["Hiring", "interns."],
    description:
      "Tell us the shape of the work and we match by hand — 2–4 candidates, not a firehose of 200. Every startup is verified by a person before the dashboard unlocks.",
    dark: true,
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
          ) : (
            <StartupApplication prefill={prefill} backHref="/" />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* the T picker                                                        */
/* ------------------------------------------------------------------ */

/** How many lines assemble across a half. */
const LINE_COUNT = 14;

/**
 * The assembling-lines hover, the Iron-Man-nanoparticle read: thin diagonal
 * rules materialise one after another from a top corner and sweep across the
 * half — top-right on the student side, top-left on the startup side.
 *
 * Pure CSS: each line owns a transition-delay, so hovering runs them in
 * sequence and un-hovering runs the sequence backwards. Only opacity and
 * transform animate, so it all stays on the compositor.
 */
function HoverLines({ from, dark }: { from: "left" | "right"; dark?: boolean }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
      style={{
        maskImage:
          from === "right"
            ? "radial-gradient(120% 120% at 100% 0%, #000 25%, transparent 72%)"
            : "radial-gradient(120% 120% at 0% 0%, #000 25%, transparent 72%)",
        WebkitMaskImage:
          from === "right"
            ? "radial-gradient(120% 120% at 100% 0%, #000 25%, transparent 72%)"
            : "radial-gradient(120% 120% at 0% 0%, #000 25%, transparent 72%)",
      }}
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
      {/* title band — the top bar of the T */}
      <header
        className="relative px-6 pt-24 pb-10 sm:px-10 sm:pt-28"
        style={{ borderBottom: "1px solid var(--lines)" }}
      >
        <Link
          href="/"
          className="absolute top-8 left-6 font-mono text-[0.72rem] tracking-[0.16em] text-muted uppercase transition-colors duration-300 hover:text-ink sm:left-10"
        >
          ← Back
        </Link>

        <h1 className="text-center text-[clamp(2.2rem,5.5vw,4.2rem)] leading-[1.02] font-semibold tracking-[-0.03em] text-ink">
          Which side are you on?
        </h1>
      </header>

      {/* the two halves — the stem of the T is the shared hairline */}
      <div className="grid flex-1 md:grid-cols-2">
        {HALVES.map((half, index) => (
          <button
            key={half.side}
            type="button"
            onClick={() => onPick(half.side)}
            className={`group relative flex cursor-pointer flex-col justify-between gap-16 px-6 py-12 text-left outline-none transition-[background-color] duration-500 sm:px-10 sm:py-14 ${
              half.dark
                ? "bg-[#0e0f0d] hover:bg-[#131512] focus-visible:bg-[#131512]"
                : "hover:bg-forest/[0.045] focus-visible:bg-forest/[0.045]"
            } ${
              index === 0
                ? "border-b border-b-[var(--lines)] md:border-r md:border-r-[var(--lines)] md:border-b-0"
                : ""
            }`}
          >
            {/* forest outline on hover/focus — inset so the grid never shifts */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
              style={{ boxShadow: "inset 0 0 0 2px var(--color-forest)" }}
            />

            <HoverLines from={half.dark ? "left" : "right"} dark={half.dark} />

            <span className="flex items-center justify-between">
              <span
                className={`font-mono text-[0.8rem] font-semibold tracking-[0.24em] uppercase transition-colors duration-300 group-hover:text-forest ${
                  half.dark ? "text-[#8c8a82]" : "text-faint"
                }`}
              >
                {half.kicker}
              </span>
              <span
                className={`font-mono text-[0.66rem] tracking-[0.16em] ${
                  half.dark ? "text-[#8c8a82]" : "text-faint"
                }`}
              >
                0{index + 1}
              </span>
            </span>

            <span
              className={`block text-[clamp(2.8rem,7vw,6.4rem)] leading-[0.98] font-bold tracking-[-0.035em] transition-colors duration-400 ${
                half.dark
                  ? "text-[#f2f0e9] group-hover:text-[#a8d5b3]"
                  : "text-ink group-hover:text-forest-deep"
              }`}
            >
              {half.title[0]}
              <br />
              {half.title[1]}
            </span>

            <span className="flex items-end justify-between gap-8">
              <span
                className={`max-w-[44ch] text-[0.92rem] leading-relaxed ${
                  half.dark ? "text-[#b0aea3]" : "text-muted"
                }`}
              >
                {half.description}
              </span>
              <span
                aria-hidden
                className={`shrink-0 text-[1.4rem] transition-[color,transform] duration-400 group-hover:translate-x-1.5 group-hover:text-forest ${
                  half.dark ? "text-[#8c8a82]" : "text-faint"
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
