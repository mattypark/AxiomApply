"use client";

import { useEffect, useState } from "react";

/**
 * Scroll progress, as its own circle at the top centre of the page.
 *
 * It used to be a chip inside the menu pill. On its own it can carry a ring
 * that fills as you scroll, which the chip could not — the number tells you
 * where you are, the arc tells you at a glance without reading.
 *
 * The arc is a stroked circle with a dash offset, so it animates on the
 * compositor and never triggers layout.
 */

const SIZE = 56;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScrollPercent() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="wel-pill relative grid place-items-center rounded-full shadow-[0_10px_30px_rgba(21,21,15,0.22)]"
      style={{ width: SIZE, height: SIZE }}
      role="progressbar"
      aria-label="Page scroll progress"
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        className="absolute inset-0 -rotate-90"
        width={SIZE}
        height={SIZE}
        aria-hidden="true"
      >
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          className="opacity-20"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE * (1 - progress / 100)}
          style={{ transition: "stroke-dashoffset 160ms linear" }}
        />
      </svg>
      <span className="relative font-mono text-[0.72rem] tabular-nums">
        {progress}
      </span>
    </div>
  );
}
