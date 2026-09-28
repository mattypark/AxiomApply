"use client";

import { useEffect, useRef, useState } from "react";
import { RocketGlyph } from "@/components/RocketGlyph";

/**
 * Progress on the full-page flow, drawn the way the welcome page draws a
 * journey: the path picker's soft track, a path-coloured trail, and the flat
 * rocket riding the front of it through one stop per section. A stop lights
 * up as the rocket reaches it, and the section names under the track go from
 * quiet to ink — RocketLoop's stops, laid flat. The last stop is the send.
 *
 * Sections get equal stretches of track, whatever their length, so the stops
 * are evenly spaced and their names never collide; inside a stretch the
 * rocket moves by the share of that section's questions done.
 *
 * Everything moves by transform. The trail and the rocket sit in layers the
 * width of the track and slide by a share of it, so a percentage translate is
 * a share of the track and the trail's rounded front never squashes the way
 * a scaleX would. The flame roars for a moment after each move and idles
 * otherwise; reduced motion drops the glide and the flicker, not the rocket.
 */

/** How long the flame roars after the rocket moves. Matches the glide. */
const BURN_MS = 900;

export function FlightPath({
  sections,
  current,
  within,
  labels = false,
  className = "",
}: {
  /** Each section's short name, in order. */
  sections: string[];
  /** The section being answered; sections.length once on the review. */
  current: number;
  /** 0–1 through the current section. */
  within: number;
  /** Section names under the track, from `lg` up where they fit. */
  labels?: boolean;
  className?: string;
}) {
  const count = Math.max(sections.length, 1);
  const progress = Math.min(Math.max((current + Math.min(within, 1)) / count, 0), 1);
  const [burning, setBurning] = useState(false);
  const last = useRef(progress);

  useEffect(() => {
    if (last.current === progress) return;
    last.current = progress;
    setBurning(true);
    const timer = window.setTimeout(() => setBurning(false), BURN_MS);
    return () => window.clearTimeout(timer);
  }, [progress]);

  const share = `${(progress * 100).toFixed(2)}%`;
  // A stop at the end of every section: the first is where section 2 begins,
  // the last is the send.
  const stops = sections.map((_, index) => index + 1);

  return (
    <div className={`relative h-6 ${className}`} aria-hidden="true">
      <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 overflow-hidden rounded-full bg-white/55">
        <div
          className="flow-glide absolute inset-0 rounded-full bg-[var(--path-em)]"
          style={{ transform: `translateX(calc(${share} - 100%))` }}
        />
      </div>

      {stops.map((stop) => (
        <span
          key={stop}
          data-lit={current >= stop}
          className="flow-stop absolute top-1/2 h-2.5 w-2.5 rounded-full"
          style={{ left: `${(stop / count) * 100}%` }}
        />
      ))}

      <div className="flow-glide absolute inset-0" style={{ transform: `translateX(${share})` }}>
        {/* Nose right, just past the trail's front. */}
        <span
          data-burning={burning}
          className="flow-rocket absolute top-1/2 left-0 block h-9 w-[18px]"
          style={{ transform: "translate(calc(-50% - 11px), -50%) rotate(90deg)" }}
        >
          <RocketGlyph width="100%" height="100%" />
        </span>
      </div>

      {labels ? (
        <div
          className="absolute inset-x-0 top-full mt-1 grid max-lg:hidden"
          style={{ gridTemplateColumns: `repeat(${count}, minmax(0, 1fr))` }}
        >
          {sections.map((name, index) => (
            <span
              key={name + index}
              data-on={index === current}
              data-done={index < current}
              className="flow-stop-name truncate px-1 text-center text-[12px] font-medium"
            >
              {name}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}
