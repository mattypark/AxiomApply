"use client";

import { useEffect } from "react";
import type { CSSProperties } from "react";
import type { Section } from "@/lib/apply-sections";
import { RocketGlyph } from "@/components/RocketGlyph";
import { useFullLook } from "@/components/onboarding/flow/look";
import { RiseWords, rise, riseEnd } from "@/components/onboarding/flow/RiseWords";

/**
 * The beat between sections: which part you are entering, how many there are,
 * and the one line that says why this part exists.
 *
 * It is what turns twenty questions into five short chapters, and it is
 * short — 1.7 seconds, gone on any click or key — because a pause you cannot
 * skip is a loading screen. The flow does not show it at all under reduced
 * motion.
 *
 * On the full-page flow it is the welcome loop's landing: the rocket hops
 * from the last section's stop to this one, the stop pops, and the section's
 * name rises in word by word. It holds a little longer there (2.1s) so the
 * name finishes arriving before the card fades.
 */
export const INTERSTITIAL_MS = 1700;
const FULL_INTERSTITIAL_MS = 2100;

export function Interstitial({
  section,
  position,
  total,
  onDone,
}: {
  section: Section;
  /** 1-based. */
  position: number;
  total: number;
  onDone: () => void;
}) {
  const full = useFullLook();

  useEffect(() => {
    const timer = window.setTimeout(onDone, full ? FULL_INTERSTITIAL_MS : INTERSTITIAL_MS);
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
    };
  }, [onDone, full]);

  if (full) {
    return <Landing section={section} position={position} total={total} onDone={onDone} />;
  }

  return (
    <button
      type="button"
      onClick={onDone}
      className="ax-interstitial absolute inset-0 z-20 flex cursor-pointer flex-col items-start justify-center bg-app-canvas text-left"
    >
      <span role="status" className="sr-only">
        Part {position} of {total}: {section.title}
      </span>
      <span aria-hidden="true" className="font-display text-[88px] leading-[1] text-app-accent sm:text-[120px]">
        {String(position).padStart(2, "0")}
        <span className="text-app-text-3/50">/{String(total).padStart(2, "0")}</span>
      </span>
      <span aria-hidden="true" className="mt-5 font-display text-[36px] leading-[40px] tracking-[-0.36px] text-app-text-1 sm:text-[44px] sm:leading-[48px]">
        {section.title}
      </span>
      {section.blurb ? (
        <span aria-hidden="true" className="mt-3 max-w-[44ch] text-[16px] leading-[24px] text-app-text-3">
          {section.blurb}
        </span>
      ) : null}
      <span aria-hidden="true" className="mt-10 text-[12px] text-app-text-3/70">
        Tap or press any key
      </span>
    </button>
  );
}

/** When the rocket touches down on the new stop, inside the hop. */
const LAND_MS = 650;

function Landing({
  section,
  position,
  total,
  onDone,
}: {
  section: Section;
  position: number;
  total: number;
  onDone: () => void;
}) {
  // Stops sit evenly from the first (0%) to the last (100%).
  const at = (stop: number) => (total > 1 ? (stop / (total - 1)) * 100 : 50);
  const titleStart = LAND_MS - 150;
  const after = riseEnd(section.title, titleStart) + 100;

  return (
    <button
      type="button"
      onClick={onDone}
      className="ax-interstitial absolute inset-0 z-20 flex cursor-pointer flex-col items-start justify-center text-left"
    >
      <span role="status" className="sr-only">
        Part {position} of {total}: {section.title}
      </span>

      <span aria-hidden="true" className="relative block h-10 w-full max-w-[24rem]">
        {/* The dotted route between the stops, like the welcome loop's circle. */}
        <span className="absolute inset-x-0 top-1/2 h-0 -translate-y-1/2 border-t-2 border-dotted border-ms-green/35" />
        {Array.from({ length: total }, (_, stop) => (
          <span
            key={stop}
            className={`absolute top-1/2 rounded-full ${
              stop === position - 1
                ? "flow-land h-4 w-4 bg-[var(--path-em)] shadow-[0_0_0_3px_#ffffff]"
                : stop < position - 1
                  ? "h-2.5 w-2.5 bg-[var(--path-em)]"
                  : "h-2.5 w-2.5 bg-white"
            }`}
            style={{ left: `${at(stop)}%`, transform: "translate(-50%, -50%)" }}
          />
        ))}
        <span
          className="flow-hop absolute inset-0"
          style={
            {
              "--from": `${at(Math.max(position - 2, 0))}%`,
              "--to": `${at(position - 1)}%`,
            } as CSSProperties
          }
        >
          <span
            className="absolute top-1/2 left-0 block h-12 w-6"
            // The glyph's box runs below the nozzle for the flame; this puts
            // the fins, not the box, just above the stop.
            style={{ transform: "translate(-50%, calc(-100% + 8px))" }}
          >
            {/* A small arc on the way over, on its own layer. */}
            <span className="flow-arc block h-full w-full">
              <RocketGlyph width="100%" height="100%" />
            </span>
          </span>
        </span>
      </span>

      <span aria-hidden="true" className="flow-rise mt-8 text-[14px] font-medium text-ms-body" style={rise(LAND_MS - 250)}>
        Part {position} of {total}
      </span>
      <span
        aria-hidden="true"
        className="ms-display mt-3 text-[clamp(2.8rem,5vw,4.6rem)] text-balance text-ms-ink"
        style={{ lineHeight: 1 }}
      >
        <RiseWords text={section.title} start={titleStart} />
      </span>
      {section.blurb ? (
        <span
          aria-hidden="true"
          className="flow-rise mt-5 max-w-[40ch] text-[19px] leading-[1.4] text-pretty text-ms-body"
          style={rise(after)}
        >
          {section.blurb}
        </span>
      ) : null}
      <span aria-hidden="true" className="flow-rise mt-10 text-[13px] text-ms-body" style={rise(after + 200)}>
        Tap or press any key
      </span>
    </button>
  );
}
