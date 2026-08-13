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
 * Three sides, set as a staggered stack on cream: each one numbered, huge, and
 * indented off the last so the eye walks down them rather than scanning a row.
 * Hovering runs the assembling lines behind the word and pulls it into forest;
 * choosing one animates the whole picker out and mounts that application.
 *
 * Contact sits bottom-left and the legal line bottom-right, so the screen
 * reads as a page rather than as a form.
 */

type Choice = {
  side: Side;
  label: string;
  note: string;
  /** Which edge the assembling lines sweep in from. */
  from: "left" | "right";
};

const CHOICES: Choice[] = [
  {
    side: "intern",
    label: "Intern",
    note: "Looking for an internship. A person reads it — you hear back within 14 days either way.",
    from: "right",
  },
  {
    side: "startup",
    label: "Startup",
    note: "Hiring interns. Matched by hand — 2–4 candidates, not a firehose of 200.",
    from: "left",
  },
  {
    side: "chapter",
    label: "Chapter",
    note: "Start one at your school. Approved one at a time, and it does not use up the other two.",
    from: "right",
  },
];

/**
 * PLACEHOLDER — not a real address or number.
 *
 * Both must be replaced before launch: a nonprofit publishing a fake postal
 * address is a real problem, not a cosmetic one, and the CAN-SPAM footer reads
 * from the same details.
 */
const ADDRESS = ["1200 Innovation Way", "Houston, TX 77002"];

const EMAIL = "matthew@axiompathways.org";

/**
 * The same links the menu carries. Get started lands here directly, so this
 * screen cannot be the only one on the site with no way anywhere else.
 */
const NAV = [
  { href: "/", label: "Homepage" },
  { href: "/about/internships", label: "About us" },
  { href: "/about/learn", label: "Who we are" },
  { href: "/#faq", label: "FAQs" },
  { href: "https://www.axiompathways.org/articles", label: "Articles" },
  { href: "/auth", label: "Sign in" },
] as const;

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
/* the picker                                                          */
/* ------------------------------------------------------------------ */

/** How many lines assemble across a row. */
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
function HoverLines({ from }: { from: "left" | "right" }) {
  // Centred vertically and wide enough to actually reach the word: the rows
  // are short and full-bleed, so a tight corner gradient faded out before it
  // got anywhere near the type.
  const mask =
    from === "right"
      ? "radial-gradient(150% 200% at 100% 50%, #000 35%, transparent 85%)"
      : "radial-gradient(150% 200% at 0% 50%, #000 35%, transparent 85%)";

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
            top: `${4 + index * 6.8}%`,
            [from === "right" ? "right" : "left"]: "-20%",
            ["--fx-origin" as string]:
              from === "right" ? "right center" : "left center",
            ["--fx-rot" as string]: from === "right" ? "-14deg" : "14deg",
            ["--fx-line-color" as string]: "rgba(47,107,61,0.42)",
            transitionDelay: `${index * 38}ms`,
          }}
        />
      ))}
    </span>
  );
}

function Picker({ onPick }: { onPick: (side: Side) => void }) {
  return (
    <main className="flex min-h-dvh flex-col bg-paper">
      <header className="flex flex-wrap items-center gap-x-7 gap-y-3 px-6 pt-9 pb-4 sm:px-12 lg:px-20">
        <Link
          href="/"
          className="font-mono text-[0.72rem] tracking-[0.16em] text-muted uppercase transition-colors duration-300 hover:text-ink"
        >
          ← Back
        </Link>

        <nav aria-label="Secondary" className="flex flex-wrap gap-x-7 gap-y-2">
          {NAV.map((link) =>
            link.href.startsWith("http") ? (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[0.95rem] text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.95rem] text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
              </Link>
            ),
          )}
        </nav>
      </header>

      {/* The stack is centred as a block; the left/right/left stagger then
          runs inside it, so the group sits in the middle of the page rather
          than hugging the left edge. */}
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        {CHOICES.map((choice, index) => (
          <button
            key={choice.side}
            type="button"
            onClick={() => onPick(choice.side)}
            aria-label={`${choice.label} — ${choice.note}`}
            className="group relative w-full cursor-pointer px-6 py-5 outline-none sm:px-12 lg:px-20"
          >
            {/* the assembling lines, behind the word rather than over a panel */}
            <HoverLines from={choice.from} />

            {/* The indent only applies from md up — on a phone every row
                starts at the same left edge or the stagger just eats width. */}
            <span className="relative mx-auto flex w-fit items-baseline gap-4 sm:gap-8">
              <span className="shrink-0 font-display text-[1rem] text-faint transition-colors duration-300 group-hover:text-forest sm:text-[1.15rem]">
                0{index + 1}
              </span>

              <span className="flex min-w-0 flex-col items-center text-center">
                <span className="block font-display text-[clamp(3rem,9.5vw,7.5rem)] leading-[0.95] font-normal tracking-[-0.02em] text-ink transition-colors duration-400 group-hover:text-forest">
                  {choice.label}
                </span>
                <span className="mt-2 max-w-[52ch] text-[0.88rem] leading-relaxed text-muted transition-colors duration-400 group-hover:text-forest-deep sm:text-[0.95rem]">
                  {choice.note}
                </span>
              </span>

            </span>
          </button>
        ))}
      </div>

      {/* Location and email. The legal links live on the pages themselves. */}
      <footer
        className="flex flex-wrap items-end justify-between gap-6 px-6 pt-6 pb-8 sm:px-12 lg:px-20"
        style={{ borderTop: "1px solid var(--lines)" }}
      >
        <address className="flex flex-col gap-1 not-italic">
          {ADDRESS.map((line) => (
            <span
              key={line}
              className="font-mono text-[0.72rem] font-semibold tracking-[0.1em] text-ink uppercase"
            >
              {line}
            </span>
          ))}
        </address>

        <a
          href={`mailto:${EMAIL}`}
          className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase transition-colors duration-200 hover:text-ink"
        >
          {EMAIL}
        </a>
      </footer>
    </main>
  );
}
