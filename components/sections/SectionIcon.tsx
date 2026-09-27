/**
 * The small line icons that lead each section label, drawn the way klinn's
 * are: 14px, 1.5 stroke, currentColor, no fill. One per beat, so the index
 * reads as a set rather than as numbers alone.
 */

export type SectionIconName = "tray" | "eye" | "loop" | "nodes" | "quote" | "help";

const PATHS: Record<SectionIconName, string> = {
  tray: "M3.5 6.5h9M4 4h8l.5 2.5V12a1 1 0 0 1-1 1h-7a1 1 0 0 1-1-1V6.5L4 4Z",
  eye: "M1.8 8S4 3.8 8 3.8 14.2 8 14.2 8 12 12.2 8 12.2 1.8 8 1.8 8Zm6.2 1.8a1.8 1.8 0 1 0 0-3.6 1.8 1.8 0 0 0 0 3.6Z",
  loop: "M5 5.5a2.5 2.5 0 1 0 0 5c1.6 0 2.4-1.2 3-2.5.6-1.3 1.4-2.5 3-2.5a2.5 2.5 0 1 1 0 5c-1.6 0-2.4-1.2-3-2.5-.6-1.3-1.4-2.5-3-2.5Z",
  nodes: "M5 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Zm9 2a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM8 12.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM4.8 5.2l6.3 1m-6.6 0 1.6 5.4m5.3-4.5-3.8 4.6",
  quote: "M3 4.5a1.5 1.5 0 0 1 1.5-1.5h7A1.5 1.5 0 0 1 13 4.5v5a1.5 1.5 0 0 1-1.5 1.5H7l-3 2.5V11h.5",
  help: "M8 14A6 6 0 1 0 8 2a6 6 0 0 0 0 12Zm-1.7-7.6A1.8 1.8 0 0 1 9.8 7c0 1.2-1.8 1.4-1.8 2.6m0 1.9h.01",
};

export function SectionIcon({
  name,
  className = "",
}: {
  name: SectionIconName;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className={`h-[15px] w-[15px] shrink-0 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
