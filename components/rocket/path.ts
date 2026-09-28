/**
 * The flight path, anchored to the page rather than stretched over it.
 *
 * The prototype mapped one 0..1 scroll value across a single curve, so the
 * loop and the close-up happened wherever the maths put them. Here every
 * keyframe names the section it belongs to: `at` is how far through that
 * element the page has scrolled when the rocket should be there (0 = the
 * element's top at the middle of the screen, 1 = its bottom). The scene turns
 * those into scroll positions and interpolates between them, so the loop
 * happens over the feed band and the close-up happens beside "get in front of
 * them." at any viewport height.
 *
 * `x`/`y` are screen coordinates (-1..1) and `z` is depth (higher is closer).
 * Depth is the dangerous axis: past ~1 the rocket is wider than a gutter, so
 * only the close-up (beside centred copy, with nothing to its right) goes deep.
 *
 * On desktop the text sits in a 49.5rem centre column, so the rocket keeps to
 * |x| >= 0.72 while text is on screen. It changes sides twice, both times
 * horizontally, far back (small) and through padding that has no text in it:
 * the top of the dark feed band, and the empty pale top of the closing band.
 */

export type Beat = {
  /** CSS selector for the section this keyframe belongs to. */
  anchor: string;
  at: number;
  x: number;
  y: number;
  z: number;
};

export const DESKTOP_PATH: Beat[] = [
  // hero — beside the buttons, then climbing the right edge
  { anchor: "#hero", at: 0.5, x: 0.74, y: -0.42, z: 0 },
  { anchor: "#hero", at: 0.85, x: 0.78, y: 0.1, z: 0.6 },
  // 01 / 02 — right gutter, drifting deep and back
  { anchor: "[data-rocket=problem]", at: 0.3, x: 0.8, y: 0.45, z: -0.5 },
  { anchor: "[data-rocket=problem]", at: 0.8, x: 0.76, y: -0.15, z: 1 },
  { anchor: "#what-you-get", at: 0.4, x: 0.8, y: -0.45, z: 0 },
  { anchor: "#what-you-get", at: 0.9, x: 0.78, y: 0.35, z: -0.5 },
  // the feed band — cross left through its empty top padding, far back,
  // then loop in the band's empty left half. The band's only text is one
  // centred line, so its sides are the one wide dark space on the page: the
  // loop fits there sideways, and the glow reads best on dark. (A loop beside
  // the text anywhere else is wider than the gutter.)
  { anchor: "[data-rocket=feed]", at: 0.3, x: 0.8, y: 0.4, z: -5 },
  { anchor: "[data-rocket=feed]", at: 0.42, x: 0, y: 0.37, z: -9 },
  { anchor: "[data-rocket=feed]", at: 0.5, x: -0.58, y: 0.3, z: -1 },
  { anchor: "[data-rocket=feed]", at: 0.58, x: -0.74, y: 0.12, z: 0 },
  { anchor: "[data-rocket=feed]", at: 0.66, x: -0.6, y: -0.06, z: 0.3 },
  { anchor: "[data-rocket=feed]", at: 0.74, x: -0.46, y: 0.12, z: 0 },
  { anchor: "[data-rocket=feed]", at: 0.82, x: -0.6, y: 0.32, z: -0.3 },
  // 03 — back to the left gutter, upright
  { anchor: "#how-it-works", at: 0.2, x: -0.82, y: 0.05, z: 0.2 },
  { anchor: "#how-it-works", at: 0.7, x: -0.8, y: -0.3, z: 0.4 },
  // 04 → 06 — left gutter, collecting
  { anchor: "[data-rocket=startups]", at: 0.3, x: -0.8, y: 0.3, z: 0 },
  { anchor: "[data-rocket=startups]", at: 0.8, x: -0.76, y: -0.35, z: 0.8 },
  { anchor: "[data-rocket=work]", at: 0.5, x: -0.8, y: 0.2, z: -0.5 },
  { anchor: "#faq", at: 0.5, x: -0.78, y: -0.3, z: 0.5 },
  // closing band — cross back right through its pale empty top, far back
  { anchor: "footer", at: 0.02, x: -0.8, y: 0.12, z: -5 },
  { anchor: "footer", at: 0.12, x: 0, y: 0.1, z: -9 },
  { anchor: "footer", at: 0.22, x: 0.8, y: 0.0, z: -4 },
  // the close-up beside "get in front of them.", then away off the top
  { anchor: "footer", at: 0.4, x: 0.82, y: -0.05, z: 1.7 },
  { anchor: "footer", at: 0.6, x: 0.8, y: 0.25, z: 1 },
  { anchor: "footer", at: 1, x: 0.86, y: 1.05, z: -1.5 },
];

/**
 * Narrow screens: no gutters to hide in, so a small rocket rides the right
 * edge the whole way down. No loop and no crossings — at this width either
 * would pass straight through the text.
 */
export const COMPACT_PATH: Beat[] = [
  { anchor: "#hero", at: 0.5, x: 0.86, y: -0.62, z: 0 },
  { anchor: "#hero", at: 0.9, x: 0.88, y: 0.3, z: 0.4 },
  { anchor: "[data-rocket=problem]", at: 0.5, x: 0.86, y: -0.2, z: 0 },
  { anchor: "#what-you-get", at: 0.5, x: 0.88, y: 0.4, z: 0.3 },
  { anchor: "[data-rocket=feed]", at: 0.5, x: 0.86, y: -0.3, z: 0.6 },
  { anchor: "#how-it-works", at: 0.5, x: 0.88, y: 0.35, z: 0 },
  { anchor: "[data-rocket=startups]", at: 0.5, x: 0.86, y: -0.35, z: 0.4 },
  { anchor: "[data-rocket=work]", at: 0.5, x: 0.88, y: 0.3, z: 0 },
  { anchor: "#faq", at: 0.5, x: 0.86, y: -0.3, z: 0.4 },
  { anchor: "footer", at: 0.4, x: 0.88, y: 0.2, z: 0.8 },
  { anchor: "footer", at: 1, x: 0.9, y: 1.1, z: -1 },
];

/** Below this width the gutters are too narrow to fly in. */
export const DESKTOP_MIN_WIDTH = 1200;

export type ResolvedPath = {
  /** Scroll position (px) of each beat, strictly increasing, unclamped. */
  positions: number[];
  /** Where real scroll stops being 1:1 with beat positions (see below). */
  stretchFrom: number;
  /** The page's maximum scroll. */
  max: number;
};

/**
 * Scroll positions for each beat.
 *
 * Beats near the bottom ask for the page to scroll further than it can — the
 * footer's last beat wants its bottom edge at mid-screen, which never happens.
 * Clamping those would pile them onto one pixel and the ending would never
 * play. Instead they keep their natural positions, and the last stretch of
 * real scroll (from the last reachable beat to the bottom) is stretched to
 * cover them, so the final beat lands exactly at the bottom of the page.
 */
export function resolveBeats(beats: Beat[]): ResolvedPath {
  const viewport = window.innerHeight;
  const max = Math.max(1, document.documentElement.scrollHeight - viewport);
  const positions: number[] = [];

  beats.forEach((beat, index) => {
    const element = document.querySelector<HTMLElement>(beat.anchor);
    const previous = positions[index - 1];
    let position = previous ?? 0;
    if (element) {
      const top = element.getBoundingClientRect().top + window.scrollY;
      position = top + beat.at * element.offsetHeight - viewport / 2;
    }
    positions.push(previous === undefined ? position : Math.max(position, previous + 1));
  });

  const reachable = positions.filter((position) => position < max);
  const stretchFrom = reachable.length ? reachable[reachable.length - 1] : 0;
  return { positions, stretchFrom, max };
}

/** Real scroll px → curve parameter (0..1), piecewise linear between beats. */
export function scrollToCurve(scroll: number, path: ResolvedPath): number {
  const { positions, stretchFrom, max } = path;
  const last = positions.length - 1;
  if (last < 1) return 0;

  let virtual = scroll;
  const end = positions[last];
  if (end > max && scroll > stretchFrom) {
    virtual = stretchFrom + ((scroll - stretchFrom) / Math.max(1, max - stretchFrom)) * (end - stretchFrom);
  }

  if (virtual <= positions[0]) return 0;
  if (virtual >= end) return 1;
  let index = 0;
  while (index < last && virtual > positions[index + 1]) index += 1;
  const span = positions[index + 1] - positions[index];
  const local = span > 0 ? (virtual - positions[index]) / span : 0;
  return (index + local) / last;
}
