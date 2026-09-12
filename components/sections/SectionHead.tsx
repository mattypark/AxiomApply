import type { ReactNode } from "react";
import { InView } from "@/components/motion/InView";

type SectionHeadProps = {
  /** Two digits, always. "01", not "1" — the numerals are a rhythm, not a count. */
  index: string;
  label: string;
  title: ReactNode;
  subcopy?: ReactNode;
  /** Dark banner and startup-side sections invert the whole lockup. */
  tone?: "paper" | "night";
};

/**
 * The repeating head of every scroll-story section: a mono eyebrow carrying the
 * section number, a display-serif statement, and at most one paragraph under it.
 *
 * The eyebrow is the only place a numeral appears at this size, which is what
 * makes the page feel indexed rather than listed. Keep titles to two lines —
 * the type scale is built for a statement, and a third line collapses it into
 * body copy.
 */
export function SectionHead({
  index,
  label,
  title,
  subcopy,
  tone = "paper",
}: SectionHeadProps) {
  const night = tone === "night";

  return (
    <header className="mx-auto w-full max-w-[68rem] px-6">
      <InView className="flex items-center gap-2 font-mono text-[0.8125rem] tracking-[0.08em]">
        <span className={night ? "text-mint" : "text-forest"}>{index}</span>
        <span className={night ? "text-night-muted" : "text-faint"}>/ {label}</span>
      </InView>

      <InView
        as="h2"
        delay={80}
        className={`mt-6 font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.04] tracking-[-0.015em] ${
          night ? "text-night-text" : "text-ink"
        }`}
      >
        {title}
      </InView>

      {subcopy ? (
        <InView
          as="p"
          delay={160}
          className={`mt-5 max-w-[46ch] text-[1.0625rem] leading-[1.55] ${
            night ? "text-night-muted" : "text-muted"
          }`}
        >
          {subcopy}
        </InView>
      ) : null}
    </header>
  );
}
