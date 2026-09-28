"use client";

import { useEffect } from "react";
import type { Section } from "@/lib/apply-sections";

/**
 * The beat between sections: which part you are entering, how many there are,
 * and the one line that says why this part exists.
 *
 * It is what turns twenty questions into five short chapters, and it is
 * short — 1.7 seconds, gone on any click or key — because a pause you cannot
 * skip is a loading screen. The flow does not show it at all under reduced
 * motion.
 */
export const INTERSTITIAL_MS = 1700;

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
  useEffect(() => {
    const timer = window.setTimeout(onDone, INTERSTITIAL_MS);
    const skip = () => onDone();
    window.addEventListener("keydown", skip);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", skip);
    };
  }, [onDone]);

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
