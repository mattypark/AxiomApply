"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { INTRO_MS } from "@/components/welcome/Preloader";

/** Matches the opening intro so the headline arrives with the bloom. */
const INTRO_S = INTRO_MS / 1000;
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/**
 * Headline reveal, matching the reference frame-for-frame.
 *
 * In the recording the two lines do not fade in together — at frame 0180
 * "Your catalog," is fully set while "instantly" is still arriving, and
 * "re-shot." lands last. That is GSAP SplitText masking by line with a
 * stagger, which is exactly what the reference site loads (SplitText +
 * split-type alongside gsap 3.12).
 *
 * Each line is wrapped in an overflow-hidden mask and slides up from below its
 * own baseline, so the type wipes into place rather than fading.
 */
export type HeadlineSegment = {
  text: string;
  muted?: boolean;
  forest?: boolean;
  /** Draws an underline left→right once the reveal has landed. */
  underline?: boolean;
};

export type HeadlineLine = {
  text?: string;
  /** Softened ink — the reference's second-line treatment. */
  muted?: boolean;
  /** Axiom forest. Used for the line that carries the brand. */
  forest?: boolean;
  /** Steps the line down one size without touching the other lines. */
  small?: boolean;
  /** Mixed-tone lines: each word run carries its own colour. */
  segments?: HeadlineSegment[];
};

function toneOf(part: { muted?: boolean; forest?: boolean }): string {
  if (part.forest) return "fx-forest";
  if (part.muted) return "wel-fg-soft";
  return "wel-fg";
}

export function HeadlineReveal({
  lines,
  className = "",
}: {
  lines: readonly HeadlineLine[];
  className?: string;
}) {
  const ref = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(el.querySelectorAll("[data-line]"), { yPercent: 0, opacity: 1 });
      return;
    }

    const ctx = gsap.context(() => {
      const split = new SplitText(el.querySelectorAll("[data-line]"), {
        type: "lines",
        linesClass: "reveal-line",
        mask: "lines",
      });

      gsap.from(split.lines, {
        yPercent: 118,
        duration: 1.05,
        ease: "expo.out",
        stagger: 0.11,
        delay: INTRO_S + 0.16,
      });

      return () => split.revert();
    }, el);

    return () => ctx.revert();
  }, [lines]);

  return (
    <h1 ref={ref} className={className}>
      {lines.map((line, index) => (
        <span
          key={line.text ?? index}
          data-line
          className={`block ${toneOf(line)} ${line.small ? "text-[0.78em]" : ""}`}
        >
          {line.segments
            ? line.segments.map((segment) => (
                <span
                  key={segment.text}
                  className={`${toneOf(segment)} ${
                    segment.underline ? "hl-underline" : ""
                  }`}
                >
                  {segment.text}
                </span>
              ))
            : line.text}
        </span>
      ))}
    </h1>
  );
}
