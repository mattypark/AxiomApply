/**
 * The flat rocket — the product rocket's silhouette (lathe body, three fins,
 * porthole, nozzle) drawn in 2D. One drawing, used by the page transition's
 * launch and the welcome page's journey loop. Nose up, in a 60×120 box; the
 * nozzle's mouth is at (30, 76), which is where the flame hangs from.
 *
 * Colours come from the path tokens (PATH COLOUR in app/globals.css), so the
 * rocket is green, blue or black with whatever path the visitor picked.
 */

export const GLYPH_VIEWBOX = "0 0 60 120";
export const GLYPH_NOZZLE = { x: 30, y: 76 };

type Part = { d: string; fill: string; opacity?: number };

export const GLYPH_FLAME: Part[] = [
  { d: "M21 76 Q30 122 39 76 Z", fill: "var(--color-ms-sky-soft)", opacity: 0.95 },
  { d: "M25.5 76 Q30 102 34.5 76 Z", fill: "#ffffff" },
];

export const GLYPH_BODY: Part[] = [
  { d: "M18 50 L6 72 L8 76 L21 68 Z", fill: "var(--launch-fins)" },
  { d: "M42 50 L54 72 L52 76 L39 68 Z", fill: "var(--launch-fins)" },
  {
    d: "M30 4 C36 10 43 22 43.6 40 C44 55 42 64 38 70 L22 70 C18 64 16 55 16.4 40 C17 22 24 10 30 4 Z",
    fill: "var(--launch-body)",
  },
  { d: "M30 4 C33.5 7.5 36.5 12 38 17 L22 17 C23.5 12 26.5 7.5 30 4 Z", fill: "#f6f8f7" },
  { d: "M24 70 L36 70 L38 76 L22 76 Z", fill: "#2a3130" },
  { d: "M28.6 54 L28.6 77 L31.4 77 L31.4 54 Z", fill: "var(--launch-fins)" },
];

export const GLYPH_PORTHOLE = { cx: 30, cy: 33, r: 5.5, fill: "#bfe6ff", stroke: "#f6f8f7", strokeWidth: 2 };

const part = ({ d, fill, opacity }: Part) =>
  `<path d="${d}" style="fill: ${fill}"${opacity === undefined ? "" : ` opacity="${opacity}"`} />`;

/** The whole rocket as an SVG string, for places that build DOM by hand. */
export function glyphSvg() {
  const { cx, cy, r, fill, stroke, strokeWidth } = GLYPH_PORTHOLE;
  return `<svg viewBox="${GLYPH_VIEWBOX}" width="100%" height="100%" aria-hidden="true">
  <g data-flame style="transform-origin: ${GLYPH_NOZZLE.x}px ${GLYPH_NOZZLE.y}px">${GLYPH_FLAME.map(part).join("")}</g>
  ${GLYPH_BODY.slice(0, 5).map(part).join("\n  ")}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
  ${part(GLYPH_BODY[5])}
</svg>`;
}
