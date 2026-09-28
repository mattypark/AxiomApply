import { Poor_Story } from "next/font/google";

/**
 * A handwritten "Recommended!" with a drawn arrow, pointing at the button it
 * sits beside — the note in the margin that nudges interns toward GitHub,
 * where their work already lives.
 *
 * Poor Story is Matthew's pick for this note only, so it is loaded here, by
 * the one component that uses it, rather than site-wide in the layout.
 * On wide screens (xl) the note hangs in the margin left of the button, and
 * EnterShell makes that margin; narrower, there is none, so it sits above
 * the button's right end instead.
 */

const hand = Poor_Story({ weight: "400", subsets: ["latin"], display: "swap" });

export function RecommendNote() {
  return (
    <span aria-hidden="true" className={`${hand.className} pointer-events-none text-ms-muted`}>
      {/* Wide: in the left margin, arrow curling right into the button. */}
      <span className="absolute top-1/2 right-full mr-3 hidden -translate-y-[70%] flex-col items-end xl:flex">
        <span className="-rotate-6 pr-10 text-[22px] leading-none whitespace-nowrap">Recommended!</span>
        <svg width="112" height="46" viewBox="0 0 112 46" fill="none" className="mt-1">
          <path
            d="M6 6 C 20 30, 52 40, 98 32"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M86 22 L 99 32 L 85 40"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>

      {/* Narrow: above the button's right end, arrow dropping onto it. */}
      <span className="absolute right-6 bottom-full mb-0.5 flex items-end gap-1 xl:hidden">
        <span className="-rotate-3 text-[18px] leading-none whitespace-nowrap">Recommended!</span>
        <svg width="34" height="30" viewBox="0 0 34 30" fill="none">
          <path d="M4 4 C 18 4, 26 12, 27 25" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <path
            d="M21 19 L 27 26 L 32 18"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
    </span>
  );
}
