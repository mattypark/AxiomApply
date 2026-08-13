"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { InternApplication } from "@/components/apply/InternApplication";
import { StartupApplication } from "@/components/apply/StartupApplication";
import { ChapterApplication } from "@/components/apply/ChapterApplication";
import type { ApplyPrefill } from "@/components/apply/ApplyEngine";
import type { Side } from "@/lib/apply-sides";
import { einLine } from "@/lib/org";

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
  /** Indent on md+, as a percentage of the row. Staggers the stack. */
  indent: string;
  /** Which edge the assembling lines sweep in from. */
  from: "left" | "right";
};

const CHOICES: Choice[] = [
  {
    side: "intern",
    label: "Intern",
    note: "Looking for an internship. A person reads it — you hear back within 14 days either way.",
    indent: "0%",
    from: "right",
  },
  {
    side: "startup",
    label: "Startup",
    note: "Hiring interns. Matched by hand — 2–4 candidates, not a firehose of 200.",
    indent: "34%",
    from: "left",
  },
  {
    side: "chapter",
    label: "Chapter",
    note: "Start one at your school. Approved one at a time, and it does not use up the other two.",
    indent: "0%",
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
const ADDRESS = ["1200 Innovation Way", "Houston, TX 77002", "+1 999 999 9999"];

const CONTACT = [
  { href: "mailto:matthew@axiompathways.org", label: "matthew@axiompathways.org" },
  { href: "https://www.instagram.com/axiompathways/", label: "Instagram" },
  {
    href: "https://www.linkedin.com/company/axiom-pathways/",
    label: "LinkedIn",
  },
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
      <header className="px-6 pt-9 pb-4 sm:px-12 lg:px-20">
        <Link
          href="/"
          className="w-fit font-mono text-[0.72rem] tracking-[0.16em] text-muted uppercase transition-colors duration-300 hover:text-ink"
        >
          ← Back
        </Link>
      </header>

      {/* the stack — numbered, staggered, one row each */}
      <div className="flex flex-1 flex-col justify-center py-6">
        {CHOICES.map((choice, index) => (
          <button
            key={choice.side}
            type="button"
            onClick={() => onPick(choice.side)}
            aria-label={`${choice.label} — ${choice.note}`}
            className="group relative w-full cursor-pointer px-6 py-5 text-left outline-none sm:px-12 lg:px-20"
          >
            {/* the assembling lines, behind the word rather than over a panel */}
            <HoverLines from={choice.from} />

            {/* The indent only applies from md up — on a phone every row
                starts at the same left edge or the stagger just eats width. */}
            <span
              className="relative flex items-baseline gap-4 sm:gap-8 md:ml-[var(--indent)]"
              style={{ ["--indent" as string]: choice.indent }}
            >
              <span className="shrink-0 font-display text-[1rem] text-faint transition-colors duration-300 group-hover:text-forest sm:text-[1.15rem]">
                0{index + 1}
              </span>

              <span className="flex min-w-0 flex-col">
                <span className="block font-display text-[clamp(3rem,9.5vw,7.5rem)] leading-[0.95] font-normal tracking-[-0.02em] text-ink transition-colors duration-400 group-hover:text-forest">
                  {choice.label}
                </span>
                <span className="mt-2 max-w-[52ch] text-[0.88rem] leading-relaxed text-muted transition-colors duration-400 group-hover:text-forest-deep sm:text-[0.95rem]">
                  {choice.note}
                </span>
              </span>

              <span
                aria-hidden
                className="ml-auto hidden shrink-0 self-center text-[1.4rem] text-faint opacity-0 transition-[opacity,transform] duration-400 group-hover:translate-x-1.5 group-hover:text-forest group-hover:opacity-100 md:block"
              >
                →
              </span>
            </span>
          </button>
        ))}
      </div>

      {/* contact bottom-left, legal bottom-right */}
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
          <span aria-hidden className="h-2" />
          {CONTACT.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target={link.href.startsWith("http") ? "_blank" : undefined}
              rel={
                link.href.startsWith("http") ? "noopener noreferrer" : undefined
              }
              className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase transition-colors duration-200 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </address>

        <div className="flex flex-col gap-1 sm:text-right">
          <p className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase">
            © 2026 Axiom Pathways
            {einLine() ? ` · ${einLine()}` : ""}
          </p>
          <p className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase">
            All rights reserved
          </p>
        </div>
      </footer>
    </main>
  );
}
