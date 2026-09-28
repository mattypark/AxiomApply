import { Fragment } from "react";
import type { CSSProperties } from "react";

/**
 * A line that rises in word by word, the way the home hero's lines do
 * (`.flow-rise` in app/globals.css: up from below with a blur, or down from
 * above when the parent's --dir is -1). Words stay real text with real
 * spaces between them, so it reads and copies as one sentence.
 */

const STEP_MS = 45;

export function RiseWords({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((word, index) => (
        <Fragment key={`${word}-${index}`}>
          <span
            className="flow-word flow-rise"
            style={{ "--d": `${start + index * STEP_MS}ms` } as CSSProperties}
          >
            {word}
          </span>
          {index < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </>
  );
}

/** When the last word of `text` starts rising, for staggering what follows it. */
export function riseEnd(text: string, start = 0) {
  return start + text.split(/\s+/).filter(Boolean).length * STEP_MS;
}

/** A delay for one `.flow-rise` element. */
export const rise = (ms: number) => ({ "--d": `${Math.round(ms)}ms` }) as CSSProperties;
