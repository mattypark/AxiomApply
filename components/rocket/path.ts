import type { ShapeName } from "@/components/rocket/model";

/**
 * Scroll → what the object is doing. Pure functions; the scene calls them
 * every frame with the eased scroll value.
 *
 * The story section is one screen per chapter with a sticky stage, so
 * `chapterFloat` is simply "how many screens into the story are we": chapter
 * k's text is centred on screen at exactly k. Each chapter spends most of its
 * screen HOLDING its shape — that is the pause, while its text rises in — and
 * only the stretch just before it (k - 0.6 → k - 0.15) is spent morphing from
 * the previous shape. Morphing while the old text leaves and the new text
 * arrives is what makes the page and the object feel like one thing.
 */

const MORPH_START = 0.6;
const MORPH_END = 0.15;

export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
export const easeOut = (t: number) => 1 - (1 - t) ** 3;
export const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

export type MorphState = { from: ShapeName; to: ShapeName; mix: number };

export function morphAt(chapterFloat: number, shapes: ShapeName[]): MorphState {
  const last = shapes.length - 1;
  const f = Math.min(Math.max(chapterFloat, 0), last);
  // Which chapter's morph window are we in (or approaching)?
  const next = Math.min(last, Math.max(1, Math.ceil(f + MORPH_END)));
  const start = next - MORPH_START;
  const end = next - MORPH_END;
  if (f < start) {
    const hold = shapes[Math.max(0, next - 1)];
    return { from: hold, to: hold, mix: 0 };
  }
  if (f >= end) return { from: shapes[next], to: shapes[next], mix: 0 };
  return { from: shapes[next - 1], to: shapes[next], mix: easeInOut((f - start) / (end - start)) };
}

/**
 * Lift-off after the last chapter: 0 while the stage is still pinned, rising
 * to 1 over the screen in which the story scrolls away. Squared, so it starts
 * slow and heavy like a rocket rather than like a UI element.
 */
export function liftAt(chapterFloat: number, chapters: number) {
  const t = clamp01((chapterFloat - (chapters - 1) - 0.15) / 0.85);
  return t * t;
}

/**
 * Landing: driven by where the pad sits on screen. 0 when the pad is still
 * below the fold, 1 once it reaches 58% of the way up. Eased out, so the
 * rocket decelerates into the pad instead of stopping on it.
 */
export function landingAt(padCentreY: number, viewportHeight: number) {
  const start = viewportHeight * 1.15;
  const end = viewportHeight * 0.58;
  return easeOut(clamp01((start - padCentreY) / (start - end)));
}
