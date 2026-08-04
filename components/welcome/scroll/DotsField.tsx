"use client";

import { useEffect, useRef } from "react";

/**
 * The footer dot field.
 *
 * Two behaviours on one grid:
 *   · an idle cycle that scatters the dots' opacity, resolves them into a
 *     random blob, then scatters again
 *   · cursor proximity — dots near the pointer shrink toward MIN_SCALE
 *
 * The grid is rebuilt on breakpoint change so density stays sane, and the idle
 * timeline is skipped entirely under prefers-reduced-motion (the field still
 * renders, it just holds still).
 */

const TOTAL_DURATION = 0.9;
const FIGURE_PAUSE = 1.1;
const CHAOS_OPACITY = 0.35;

/**
 * The figures the field resolves into — the Axiom "A" and a person icon,
 * alternating each cycle. Drawn as pixel maps, anchored to the BOTTOM edge of
 * the grid with their lower rows deliberately hanging past it: rows beyond the
 * grid have no dots, so only the top of each figure appears, rising out of
 * the field's bottom edge like the reference.
 */
const FIGURES: string[][] = [
  // Axiom "A" — 21 wide, drawn large so it reads at desktop density
  [
    ".........###.........",
    "........#####........",
    ".......##...##.......",
    "......##.....##......",
    ".....##.......##.....",
    "....##.........##....",
    "...##...........##...",
    "...###############...",
    "..##.............##..",
    ".##...............##.",
    "##.................##",
    "##.................##",
  ],
  // person — head and shoulders, 17 wide
  [
    "......#####......",
    ".....#######.....",
    ".....#######.....",
    ".....#######.....",
    "......#####......",
    "....#########....",
    "..#############..",
    ".###############.",
    "#################",
    "#################",
  ],
];

/** How many rows of each figure stay visible above the bottom edge. */
const VISIBLE_ROWS = 8;

const MAX_DISTANCE = 200;
const MIN_SCALE = 0.25;

function gridFor(width: number) {
  if (width >= 992) return { mode: "desktop", cols: 52, rows: 15 };
  if (width >= 768) return { mode: "tablet", cols: 32, rows: 12 };
  return { mode: "mobile", cols: 20, rows: 10 };
}

export function DotsField() {
  const fieldRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const field = fieldRef.current;
    if (!field) return;

    let cleanup = () => {};
    let cancelled = false;

    void (async () => {
      const { default: gsap } = await import("gsap");
      if (cancelled || !fieldRef.current) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      let lastMode = "";
      let dots: HTMLElement[] = [];
      let idle: gsap.core.Timeline | null = null;

      let figureIndex = 0;

      const build = () => {
        const { mode, cols, rows } = gridFor(window.innerWidth);
        if (mode === lastMode) return;
        lastMode = mode;

        field.replaceChildren();
        field.style.gridTemplateColumns = `repeat(${cols}, min-content)`;

        const fragment = document.createDocumentFragment();
        for (let index = 0; index < cols * rows; index += 1) {
          const dot = document.createElement("span");
          dot.className = "dot";
          dot.dataset.col = String(index % cols);
          dot.dataset.row = String(Math.floor(index / cols));
          fragment.appendChild(dot);
        }
        field.appendChild(fragment);
        dots = Array.from(field.querySelectorAll<HTMLElement>(".dot"));

        idle?.kill();
        if (reduced) return;

        // Chaos → figure → chaos, forever.
        idle = gsap.timeline({ repeat: -1, repeatDelay: FIGURE_PAUSE });
        idle.to(dots, {
          opacity: () => CHAOS_OPACITY + Math.random() * (1 - CHAOS_OPACITY),
          duration: TOTAL_DURATION,
          ease: "none",
          // `amount` spreads the whole stagger across TOTAL_DURATION. `each`
          // would multiply by the dot count — 780 dots × 0.04s meant the
          // figure only appeared after ~31 seconds.
          stagger: { amount: TOTAL_DURATION, from: "random" },
        });
        idle.call(() => {
          // Alternate person → Axiom mark, anchored top-centre of the field.
          const figure = FIGURES[figureIndex % FIGURES.length];
          figureIndex += 1;

          const width = figure[0].length;
          const colOffset = Math.max(0, Math.floor((cols - width) / 2));
          // Bottom-anchored: rows past the grid edge simply have no dots to
          // light, so the figure appears cut off — top only.
          const rowOffset = rows - VISIBLE_ROWS;

          const lit = new Set<string>();
          figure.forEach((rowString, y) => {
            for (let x = 0; x < rowString.length; x += 1) {
              if (rowString[x] === "#") {
                lit.add(`${colOffset + x},${rowOffset + y}`);
              }
            }
          });

          for (const dot of dots) {
            dot.classList.toggle(
              "is-on",
              lit.has(`${dot.dataset.col},${dot.dataset.row}`),
            );
          }
        });
        idle.to(dots, {
          opacity: 1,
          duration: TOTAL_DURATION * 0.5,
          ease: "power1.out",
        });
      };

      build();

      const onResize = () => build();
      const onMove = (event: MouseEvent) => {
        if (dots.length === 0) return;

        const bounds = field.getBoundingClientRect();
        if (
          event.clientY < bounds.top - MAX_DISTANCE ||
          event.clientY > bounds.bottom + MAX_DISTANCE
        ) {
          return;
        }

        for (const dot of dots) {
          const rect = dot.getBoundingClientRect();
          const dx = event.clientX - (rect.left + rect.width / 2);
          const dy = event.clientY - (rect.top + rect.height / 2);
          const t = Math.min(Math.hypot(dx, dy) / MAX_DISTANCE, 1);

          dot.style.transform = `scale(${MIN_SCALE + t * (1 - MIN_SCALE)})`;
        }
      };

      window.addEventListener("resize", onResize);
      document.addEventListener("mousemove", onMove, { passive: true });

      cleanup = () => {
        window.removeEventListener("resize", onResize);
        document.removeEventListener("mousemove", onMove);
        idle?.kill();
      };
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return <div ref={fieldRef} className="dots-field" aria-hidden="true" />;
}
