"use client";

import { useEffect, useState } from "react";
import { RocketGlyph } from "@/components/RocketGlyph";
import type { Side } from "@/lib/apply-sides";
import type { Stage } from "@/components/preview/mock-data";

/**
 * Received → read → decision, as the PathPicker's soft track with the flat
 * rocket flying along it. The rocket is the "you are here": it flies to the
 * current stop on arrival and parks (engine off) once there is a decision.
 *
 * "Read" is a real, cheap signal: the Sheet's reviewer column is filled in
 * the moment someone picks an application up (lib/sheet-decisions.ts).
 */

const STOP_NAMES: Record<Side, [string, string, string]> = {
  intern: ["Received", "Read", "Decision"],
  startup: ["Received", "Read", "Approval"],
  chapter: ["Received", "In review", "Decision"],
};

const PROGRESS: Record<Stage, number> = { received: 0, read: 0.5, decided: 1 };

export type StopDates = [string, string | null, string];

export function StatusTrack({
  side,
  stage,
  dates,
  expected,
}: {
  side: Side;
  stage: Stage;
  /** Received date, read date (if read), and decision date or the promise. */
  dates: StopDates;
  /** True when the third date is the "by …" promise rather than a real date. */
  expected: boolean;
}) {
  // Start at the first stop and fly to the real one after paint, so the
  // rocket visibly travels on arrival. Reduced motion skips the travel.
  const [flown, setFlown] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setFlown(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const progress = flown ? PROGRESS[stage] : 0;
  const reached = [true, stage !== "received", stage === "decided"];
  const names = STOP_NAMES[side];

  return (
    <div className="px-5">
      <div className="relative h-14">
        {/* Track and its path-coloured fill (scaleX, so only transform animates). */}
        <div className="absolute inset-x-0 top-1/2 h-2.5 -translate-y-1/2 rounded-full bg-ms-mist" />
        <div
          className="absolute inset-x-0 top-1/2 h-2.5 origin-left rounded-full bg-ms-green transition-transform duration-[1400ms] ease-ms motion-reduce:transition-none"
          style={{ transform: `translateY(-50%) scaleX(${progress})` }}
        />
        {[0, 0.5, 1].map((at, index) => (
          <span
            key={at}
            className={`absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white transition-colors duration-500 ${
              reached[index] ? "bg-ms-green" : "bg-[#d5dade]"
            }`}
            style={{ left: `${at * 100}%` }}
          />
        ))}
        {/* The wrapper is as wide as the track, so translateX(100%) is the far end. */}
        <div
          className="pointer-events-none absolute inset-0 transition-transform duration-[1400ms] ease-ms motion-reduce:transition-none"
          style={{ transform: `translateX(${progress * 100}%)` }}
        >
          <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-[130%] rotate-90">
            <RocketGlyph width={18} height={36} flame={stage !== "decided"} />
          </div>
        </div>
      </div>

      <ol className="relative mt-1 grid grid-cols-3 text-[14px]">
        {names.map((name, index) => {
          const date = dates[index];
          const align = index === 0 ? "text-left -ml-5" : index === 1 ? "text-center" : "text-right -mr-5";
          return (
            <li key={name} className={align}>
              <span className={`block font-medium ${reached[index] ? "text-ms-ink" : "text-ms-muted"}`}>{name}</span>
              <span className="block text-[13px] text-ms-muted">
                {date ? (index === 2 && expected ? `by ${date}` : date) : "—"}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
