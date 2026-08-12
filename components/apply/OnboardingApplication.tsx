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
 * Three sides now, so the layout is a triangle rather than the old split: one
 * shape, cut into three wedges by a horizontal rule and a stem down to the
 * base. Hovering a wedge fills it in its application's own surface colour and
 * draws its edges in forest; choosing one animates the whole picker out and
 * mounts that application in place.
 *
 * Below `md` the triangle is unreadable — the wedge interiors are too narrow
 * for a phone — so it collapses to three stacked bands carrying the same copy.
 */

type Wedge = {
  side: Side;
  kicker: string;
  label: string;
  blurb: string;
  /** SVG polygon points, and the same geometry as a clip-path. */
  points: [number, number][];
  /** Where the copy sits inside the wedge, as inset percentages. */
  copy: { top: string; left: string; width: string; align: "center" | "left" };
  /** Which side the assembling lines sweep in from. */
  from: "left" | "right";
  /**
   * Where the lines fade in from, as a background-position on the FULL
   * container — the button box is the whole triangle, not the wedge, so a
   * corner origin would land outside this wedge and mask the lines away.
   */
  maskAt: string;
  /** Fill on hover — each application's own surface. Null keeps it white. */
  fill: string | null;
};

/**
 * Triangle: apex (50,3), base (2,97)–(98,97). A horizontal cut at y=58 meets
 * the sides at x=21.9 and x=78.1, and a stem drops from (50,58) to the base.
 *
 * The cut sits below the midpoint on purpose: at the midpoint the top wedge is
 * too narrow to hold a line of text without the clip-path slicing through it.
 * Copy boxes are inset to each wedge's safe interior for the same reason —
 * clip-path silently cuts overflow rather than reflowing it.
 */
const CUT_Y = 58;
const CUT_LEFT = 21.9;
const CUT_RIGHT = 78.1;

const WEDGES: Wedge[] = [
  {
    side: "intern",
    kicker: "Student",
    label: "Looking for an internship.",
    blurb: "A person reads it. You hear back within 14 days.",
    points: [
      [50, 3],
      [CUT_RIGHT, CUT_Y],
      [CUT_LEFT, CUT_Y],
    ],
    copy: { top: "31%", left: "34%", width: "32%", align: "center" },
    from: "right",
    maskAt: "50% 6%",
    fill: null,
  },
  {
    side: "startup",
    kicker: "Startup",
    label: "Hiring interns.",
    blurb: "Matched by hand — 2–4 candidates, not 200 résumés.",
    points: [
      [CUT_LEFT, CUT_Y],
      [50, CUT_Y],
      [50, 97],
      [2, 97],
    ],
    copy: { top: "66%", left: "20%", width: "28%", align: "left" },
    from: "left",
    maskAt: "6% 96%",
    fill: "#0e0f0d",
  },
  {
    side: "chapter",
    kicker: "Chapter",
    label: "Start a chapter.",
    blurb: "Bring Axiom to your school. You can still do the other two.",
    points: [
      [50, CUT_Y],
      [CUT_RIGHT, CUT_Y],
      [98, 97],
      [50, 97],
    ],
    copy: { top: "66%", left: "52%", width: "28%", align: "left" },
    from: "right",
    maskAt: "94% 96%",
    fill: "#2e302c",
  },
];

const toPoints = (points: [number, number][]) =>
  points.map(([x, y]) => `${x},${y}`).join(" ");

const toClipPath = (points: [number, number][]) =>
  `polygon(${points.map(([x, y]) => `${x}% ${y}%`).join(", ")})`;

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
 * wedge. The button is clip-pathed, so they are clipped to the wedge with it.
 *
 * Pure CSS: each line owns a transition-delay, so hovering runs them in
 * sequence and un-hovering runs the sequence backwards. Only opacity and
 * transform animate, so it all stays on the compositor.
 */
function HoverLines({
  from,
  dark,
  maskAt,
}: {
  from: "left" | "right";
  dark?: boolean;
  maskAt: string;
}) {
  const mask = `radial-gradient(90% 90% at ${maskAt}, #000 20%, transparent 70%)`;

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

      {/* ---- the triangle (md and up) ---- */}
      <div className="hidden flex-1 items-center justify-center px-6 py-10 md:flex">
        <div className="relative aspect-[1.5/1] h-[min(62dvh,500px)]">
          {WEDGES.map((wedge, index) => (
            <button
              key={wedge.side}
              type="button"
              onClick={() => onPick(wedge.side)}
              aria-label={`${wedge.kicker} — ${wedge.label}`}
              // clip-path shapes the hit area as well as the paint, so the
              // three buttons can overlap in the box without stealing each
              // other's clicks.
              className="group absolute inset-0 cursor-pointer outline-none"
              style={{ clipPath: toClipPath(wedge.points) }}
            >
              {/* fill — each application's own surface, on hover only */}
              <span
                aria-hidden
                className="absolute inset-0 opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
                style={{
                  background: wedge.fill ?? "rgba(47,107,61,0.06)",
                }}
              />

              <HoverLines
                from={wedge.from}
                dark={Boolean(wedge.fill)}
                maskAt={wedge.maskAt}
              />

              {/* this wedge's own edges, drawn forest on hover. A boxShadow
                  inset would trace the button's rectangle, not its shape. */}
              <svg
                aria-hidden
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full opacity-0 transition-opacity duration-400 group-hover:opacity-100 group-focus-visible:opacity-100"
              >
                <polygon
                  points={toPoints(wedge.points)}
                  fill="none"
                  stroke="var(--color-forest)"
                  strokeWidth={2}
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <span
                className="absolute flex flex-col gap-2"
                style={{
                  top: wedge.copy.top,
                  left: wedge.copy.left,
                  width: wedge.copy.width,
                  textAlign: wedge.copy.align,
                  alignItems:
                    wedge.copy.align === "center" ? "center" : "flex-start",
                }}
              >
                <span
                  className={`font-mono text-[0.68rem] font-semibold tracking-[0.24em] uppercase transition-colors duration-300 ${
                    wedge.fill
                      ? "text-faint group-hover:text-[#a8d5b3]"
                      : "text-faint group-hover:text-forest"
                  }`}
                >
                  {`0${index + 1} — ${wedge.kicker}`}
                </span>
                <span
                  className={`block text-[clamp(0.95rem,1.5vw,1.3rem)] leading-[1.14] font-bold tracking-[-0.025em] transition-colors duration-400 ${
                    wedge.fill
                      ? "text-ink group-hover:text-[#f2f0e9]"
                      : "text-ink group-hover:text-forest-deep"
                  }`}
                >
                  {wedge.label}
                </span>
                <span
                  className={`text-[0.76rem] leading-[1.5] transition-colors duration-400 ${
                    wedge.fill
                      ? "text-muted group-hover:text-[#b0aea3]"
                      : "text-muted"
                  }`}
                >
                  {wedge.blurb}
                </span>
              </span>
            </button>
          ))}

          {/* the resting hairlines: outer triangle plus the two cuts. Sits
              above the buttons but takes no pointer events. */}
          <svg
            aria-hidden
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="pointer-events-none absolute inset-0 h-full w-full"
          >
            <g
              fill="none"
              stroke="var(--lines)"
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            >
              <polygon points="50,3 98,97 2,97" />
              <line x1={CUT_LEFT} y1={CUT_Y} x2={CUT_RIGHT} y2={CUT_Y} />
              <line x1="50" y1={CUT_Y} x2="50" y2="97" />
            </g>
          </svg>
        </div>
      </div>

      {/* ---- stacked bands (below md) ---- */}
      <div className="flex flex-1 flex-col md:hidden">
        {WEDGES.map((wedge, index) => (
          <button
            key={wedge.side}
            type="button"
            onClick={() => onPick(wedge.side)}
            className="group relative flex flex-1 cursor-pointer flex-col justify-center gap-2 border-b border-b-[var(--lines)] px-6 py-10 text-left outline-none transition-colors duration-400 last:border-b-0"
            style={
              wedge.fill
                ? undefined
                : { backgroundColor: "transparent" }
            }
          >
            <span className="font-mono text-[0.66rem] font-semibold tracking-[0.24em] text-faint uppercase">
              {`0${index + 1} — ${wedge.kicker}`}
            </span>
            <span className="text-[1.5rem] leading-[1.1] font-bold tracking-[-0.03em] text-ink">
              {wedge.label}
            </span>
            <span className="max-w-[38ch] text-[0.85rem] leading-relaxed text-muted">
              {wedge.blurb}
            </span>
            <span
              aria-hidden
              className="absolute right-6 bottom-10 text-[1.2rem] text-faint"
            >
              →
            </span>
          </button>
        ))}
      </div>
    </main>
  );
}
