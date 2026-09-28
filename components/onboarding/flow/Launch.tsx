"use client";

import type { CSSProperties } from "react";
import { RocketGlyph } from "@/components/RocketGlyph";

/**
 * The send, as a launch: the flat rocket climbs out from below the screen,
 * straight up through the middle and out of the top, and leaves a column of
 * smoke that blooms and thins behind it — the page transition's launch, in
 * the flow's own light colours. It plays once, over everything, and takes
 * no clicks.
 *
 * The rocket accelerates (ease-in, position ≈ time²), so a puff at height f
 * is laid when the rocket gets there, at √f of the climb. Under reduced
 * motion the whole layer is display:none; the result screen is complete
 * without it.
 */

const CLIMB_DELAY_S = 0.35;
const CLIMB_S = 1.7;

/** Height (share of the screen from the bottom), sideways drift, size. */
const PUFFS: { f: number; dx: number; size: number }[] = [
  { f: 0.02, dx: -70, size: 72 },
  { f: 0.02, dx: 64, size: 64 },
  { f: 0.04, dx: -18, size: 84 },
  { f: 0.1, dx: 22, size: 56 },
  { f: 0.2, dx: -14, size: 48 },
  { f: 0.32, dx: 12, size: 42 },
  { f: 0.46, dx: -10, size: 36 },
  { f: 0.62, dx: 8, size: 30 },
  { f: 0.8, dx: -6, size: 24 },
];

export function Launch() {
  return (
    <div aria-hidden="true" className="flow-launch pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {PUFFS.map((puff, index) => (
        <span
          key={index}
          className={`flow-puff absolute rounded-full blur-[2px] ${index % 2 ? "bg-white" : "bg-ms-sky-soft"}`}
          style={
            {
              width: puff.size,
              height: puff.size,
              left: `calc(50% - ${puff.size / 2}px)`,
              bottom: `calc(${puff.f * 100}% - ${puff.size / 2}px)`,
              "--dx": `${puff.dx}px`,
              "--dy": `${-12 - puff.f * 20}px`,
              "--s": 2.2 - puff.f,
              "--delay": `${CLIMB_DELAY_S + CLIMB_S * Math.sqrt(puff.f)}s`,
            } as CSSProperties
          }
        />
      ))}

      <span
        className="flow-climb absolute left-1/2 block h-[120px] w-[60px] -translate-x-1/2"
        style={{ bottom: -120, "--climb": `${CLIMB_S}s`, "--climb-delay": `${CLIMB_DELAY_S}s` } as CSSProperties}
      >
        <RocketGlyph width="100%" height="100%" />
      </span>
    </div>
  );
}
