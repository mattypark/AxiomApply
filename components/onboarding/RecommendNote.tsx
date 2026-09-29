"use client";

import { useEffect, useRef, useState } from "react";
import { Poor_Story } from "next/font/google";

/**
 * A handwritten "Recommended!" with a drawn arrow, pointing at the button it
 * sits beside — the note in the margin that nudges interns toward GitHub,
 * where their work already lives. It draws itself: the word writes on left
 * to right, then the arrow is drawn out after it, the first time the note
 * comes into view.
 *
 * Poor Story is Matthew's pick for this note only, so it is loaded here, by
 * the one component that uses it, rather than site-wide in the layout.
 *
 * `placement="margin"` hangs it in the left margin on wide screens (xl, where
 * EnterShell leaves room) and above the button's right end below that;
 * `placement="above"` always sits above; `placement="below"` sits under the
 * button's bottom-right corner, arrow pointing up, and keeps a small double
 * pulse going — the home's apply block uses it.
 */

const hand = Poor_Story({ weight: "400", subsets: ["latin"], display: "swap" });

const WRITE_MS = 650;
const ARROW_MS = 450;
const EASE = "cubic-bezier(0.65, 0, 0.35, 1)";

function useDrawn() {
  const ref = useRef<HTMLSpanElement>(null);
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDrawn(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setDrawn(true);
        observer.disconnect();
      },
      // The anchor is zero-size (its drawing is absolutely placed), so any
      // overlap counts; a little inset waits until it is properly on screen.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return { ref, drawn };
}

/** The word, revealed left to right like a pen crossing the page. */
function Written({ drawn, className }: { drawn: boolean; className: string }) {
  return (
    <span
      className={`inline-block leading-none whitespace-nowrap ${className}`}
      style={{
        clipPath: drawn ? "inset(-30% -10% -30% 0)" : "inset(-30% 100% -30% 0)",
        transition: `clip-path ${WRITE_MS}ms ${EASE}`,
      }}
    >
      Recommended!
    </span>
  );
}

/** One stroke of the arrow, drawn out once the word is written. */
function Stroke({ d, drawn, delay, width }: { d: string; drawn: boolean; delay: number; width: number }) {
  return (
    <path
      d={d}
      pathLength={1}
      stroke="currentColor"
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{
        strokeDasharray: 1,
        strokeDashoffset: drawn ? 0 : 1,
        transition: `stroke-dashoffset ${ARROW_MS}ms ${EASE} ${delay}ms`,
      }}
    />
  );
}

export function RecommendNote({ placement = "margin" }: { placement?: "margin" | "above" | "below" }) {
  const { ref, drawn } = useDrawn();
  const shaft = WRITE_MS;
  const head = WRITE_MS + ARROW_MS * 0.8;

  const above = (
    <span
      className={`absolute right-5 bottom-full mb-0.5 flex items-end gap-0.5 ${
        placement === "margin" ? "xl:hidden" : ""
      }`}
    >
      <Written drawn={drawn} className="-rotate-3 text-[15px]" />
      <svg width="26" height="24" viewBox="0 0 34 30" fill="none">
        <Stroke d="M4 4 C 18 4, 26 12, 27 25" drawn={drawn} delay={shaft} width={2.2} />
        <Stroke d="M21 19 L 27 26 L 32 18" drawn={drawn} delay={head} width={2.2} />
      </svg>
    </span>
  );

  const below = (
    <span
      className={`absolute top-full right-5 mt-1 flex origin-top-right items-start gap-0.5 ${
        drawn ? "note-beat" : ""
      }`}
      // The pulse waits until the word and arrow have finished drawing.
      style={{ animationDelay: `${WRITE_MS + ARROW_MS + 300}ms` }}
    >
      <Written drawn={drawn} className="mt-3 -rotate-3 text-[15px]" />
      <svg width="26" height="24" viewBox="0 0 34 30" fill="none">
        <Stroke d="M4 26 C 18 26, 26 18, 27 5" drawn={drawn} delay={shaft} width={2.2} />
        <Stroke d="M21 11 L 27 4 L 32 12" drawn={drawn} delay={head} width={2.2} />
      </svg>
    </span>
  );

  return (
    <span ref={ref} aria-hidden="true" className={`${hand.className} pointer-events-none text-ms-muted`}>
      {placement === "below" ? below : null}
      {placement === "margin" ? (
        // Wide: in the left margin, arrow curling right into the button.
        <span className="absolute top-1/2 right-full mr-2 hidden -translate-y-[68%] flex-col items-end xl:flex">
          <Written drawn={drawn} className="-rotate-6 pr-8 text-[17px]" />
          <svg width="82" height="34" viewBox="0 0 112 46" fill="none" className="mt-0.5">
            <Stroke d="M6 6 C 20 30, 52 40, 98 32" drawn={drawn} delay={shaft} width={2.6} />
            <Stroke d="M86 22 L 99 32 L 85 40" drawn={drawn} delay={head} width={2.6} />
          </svg>
        </span>
      ) : null}
      {placement === "below" ? null : above}
    </span>
  );
}
