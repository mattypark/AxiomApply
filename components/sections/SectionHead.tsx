import type { ReactNode } from "react";
import { InView } from "@/components/motion/InView";
import { SectionIcon, type SectionIconName } from "@/components/sections/SectionIcon";

type SectionHeadProps = {
  /** Two digits, always. "01", not "1" — the numerals are a rhythm, not a count. */
  index: string;
  label: string;
  icon?: SectionIconName;
  title: ReactNode;
  subcopy?: ReactNode;
  /** Dark banner and startup-side sections invert the whole lockup. */
  tone?: "paper" | "night";
  /** Inside a grid column: drop the page-width container. */
  bare?: boolean;
};

/**
 * klinn's section head: a small line icon, the number in the accent green,
 * "/ label" in muted, then a serif statement and at most one paragraph.
 *
 * Titles are two lines at most, with the second usually in italic — pass it as
 * `<em>`. In the subcopy, wrap the sentence that lands in `<Loud>` so it reads
 * a step darker than the lead-in, which is how klinn ends every paragraph.
 */
export function SectionHead({
  index,
  label,
  icon,
  title,
  subcopy,
  tone = "paper",
  bare = false,
}: SectionHeadProps) {
  const night = tone === "night";

  return (
    <header className={bare ? "" : "mx-auto w-full max-w-[49.5rem] px-6"}>
      <InView className="flex items-center gap-2 text-body-small">
        {icon ? (
          <SectionIcon
            name={icon}
            className={night ? "text-night-muted" : "text-secondary"}
          />
        ) : null}
        <span className={night ? "text-mint" : "text-accent"}>{index}</span>
        <span className={night ? "text-night-muted" : "text-muted"}>/ {label}</span>
      </InView>

      <InView
        as="h2"
        delay={80}
        className={`mt-5 font-display text-title-h2 [&_em]:italic ${
          night ? "text-night-text" : "text-loud"
        }`}
      >
        {title}
      </InView>

      {subcopy ? (
        <InView
          as="p"
          delay={160}
          className={`mt-4 max-w-[50ch] text-body-large ${
            night ? "text-night-muted" : "text-muted"
          }`}
        >
          {subcopy}
        </InView>
      ) : null}
    </header>
  );
}

/** The closing sentence of a paragraph, one step louder than the rest. */
export function Loud({ children }: { children: ReactNode }) {
  return <span className="text-loud">{children}</span>;
}
