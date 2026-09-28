"use client";

import { useEffect, useRef } from "react";
import {
  GLYPH_BODY,
  GLYPH_FLAME,
  GLYPH_NOZZLE,
  GLYPH_PORTHOLE,
  GLYPH_VIEWBOX,
} from "@/components/rocket-glyph";
import type { Side } from "@/lib/apply-sides";

/**
 * The welcome page's picture: the path as a journey. A small rocket flies a
 * loop through four stops — for an intern, Start → Intern → Full time →
 * Founder → back to Start (a startup: Post → Interview → Hire; a chapter:
 * Found → Recruit → Lead) — pausing at each while its name lights up, and
 * trailing exhaust along the track. Pick another path and the stops change
 * and it starts again from Start.
 *
 * Frames are written straight to the DOM from one rAF loop; React only
 * renders the stops. Reduced motion shows the rocket parked at Start with
 * every stop named.
 */

// Bottom, left, top, right. The side stops sit beside the arch's edge, so
// their names stay one short word; the top stop has room for two.
const STOPS: Record<Side, [string, string, string, string]> = {
  intern: ["Start", "Intern", "Full time", "Founder"],
  startup: ["Start", "Post", "Interview", "Hire"],
  chapter: ["Start", "Found", "Recruit", "Lead"],
};

/** Viewbox of the picture, sized to the welcome page's arch (0.8 aspect). */
const W = 400;
const H = 500;
/** The loop: an upright oval. Stops sit at bottom, left, top, right. */
const CX = 200;
const CY = 275;
const RX = 92;
const RY = 165;
const LOOP = `M ${CX} ${CY + RY} A ${RX} ${RY} 0 0 1 ${CX - RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX} ${CY - RY} A ${RX} ${RY} 0 0 1 ${CX + RX} ${CY} A ${RX} ${RY} 0 0 1 ${CX} ${CY + RY}`;
const STOP_POINTS = [
  { x: CX, y: CY + RY },
  { x: CX - RX, y: CY },
  { x: CX, y: CY - RY },
  { x: CX + RX, y: CY },
];
/** Where each stop's name sits: just outside the loop, beside its stop. */
const LABELS: { x: number; y: number; anchor: "start" | "middle" | "end" }[] = [
  { x: CX, y: CY + RY + 38, anchor: "middle" },
  { x: CX - RX - 16, y: CY + 8, anchor: "end" },
  { x: CX, y: CY - RY - 22, anchor: "middle" },
  { x: CX + RX + 16, y: CY + 8, anchor: "start" },
];

const TRAVEL_MS = 1300;
const DWELL_MS = 750;
const LEG_MS = TRAVEL_MS + DWELL_MS;
const ROCKET_H = 92;
/** How much of the loop behind the rocket shows as exhaust, as a fraction. */
const TRAIL = 0.16;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

export function RocketLoop({ side, className = "" }: { side: Side; className?: string }) {
  const trackRef = useRef<SVGPathElement>(null);
  const trailRef = useRef<SVGPathElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const flameRef = useRef<SVGGElement>(null);
  const labelsRef = useRef<(SVGTextElement | null)[]>([]);
  const stops = STOPS[side];

  useEffect(() => {
    const track = trackRef.current;
    const trail = trailRef.current;
    const rocket = rocketRef.current;
    if (!track || !trail || !rocket) return;

    const total = track.getTotalLength();
    const scale = ROCKET_H / 120;
    let active = -1;

    const light = (index: number) => {
      if (index === active) return;
      active = index;
      labelsRef.current.forEach((label, i) => label?.setAttribute("data-on", String(i === index)));
    };

    const place = (distance: number, time: number) => {
      const at = track.getPointAtLength(distance);
      const ahead = track.getPointAtLength((distance + 1) % total);
      const angle = (Math.atan2(ahead.y - at.y, ahead.x - at.x) * 180) / Math.PI + 90;
      // The glyph's centre of mass sits on the track, nose along the tangent.
      rocket.setAttribute(
        "transform",
        `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${scale}) translate(-30 -48)`,
      );
      flameRef.current?.setAttribute(
        "transform",
        `translate(${GLYPH_NOZZLE.x} ${GLYPH_NOZZLE.y}) scale(1 ${(1 + Math.sin(time / 45) * 0.16).toFixed(3)}) translate(${-GLYPH_NOZZLE.x} ${-GLYPH_NOZZLE.y})`,
      );
      const trailLength = total * TRAIL;
      trail.style.strokeDasharray = `${trailLength} ${total}`;
      trail.style.strokeDashoffset = String(trailLength - distance);
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(0.01, 0);
      trail.style.opacity = "0";
      labelsRef.current.forEach((label) => label?.setAttribute("data-on", "true"));
      return;
    }

    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const leg = Math.floor(elapsed / LEG_MS) % 4;
      const inLeg = elapsed % LEG_MS;
      const travel = Math.min(1, inLeg / TRAVEL_MS);
      const distance = ((leg + easeInOut(travel)) / 4) * total;
      place(distance % total, now);
      // A stop lights as the rocket arrives and stays lit while it waits.
      light(travel >= 0.92 ? (leg + 1) % 4 : leg);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [side]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${stops.join(", then ")}, and round again`}
      className={`h-full w-full ${className}`}
    >
      <path
        ref={trackRef}
        d={LOOP}
        fill="none"
        stroke="var(--color-ms-ink)"
        strokeOpacity={0.12}
        strokeWidth={2}
        strokeDasharray="2 9"
        strokeLinecap="round"
      />
      <path
        ref={trailRef}
        d={LOOP}
        fill="none"
        stroke="var(--launch-body)"
        strokeOpacity={0.35}
        strokeWidth={7}
        strokeLinecap="round"
      />

      {STOP_POINTS.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={5} fill="var(--color-ms-green)" />
      ))}

      {stops.map((name, index) => (
        <text
          key={`${side}-${name}`}
          ref={(node) => {
            labelsRef.current[index] = node;
          }}
          x={LABELS[index].x}
          y={LABELS[index].y}
          textAnchor={LABELS[index].anchor}
          data-on="false"
          className="rocket-loop-stop"
        >
          {name}
        </text>
      ))}

      <g ref={rocketRef}>
        <svg viewBox={GLYPH_VIEWBOX} width={60} height={120} overflow="visible">
          <g ref={flameRef}>
            {GLYPH_FLAME.map((part) => (
              <path key={part.d} d={part.d} style={{ fill: part.fill }} opacity={part.opacity} />
            ))}
          </g>
          {GLYPH_BODY.slice(0, 5).map((part) => (
            <path key={part.d} d={part.d} style={{ fill: part.fill }} />
          ))}
          <circle
            cx={GLYPH_PORTHOLE.cx}
            cy={GLYPH_PORTHOLE.cy}
            r={GLYPH_PORTHOLE.r}
            fill={GLYPH_PORTHOLE.fill}
            stroke={GLYPH_PORTHOLE.stroke}
            strokeWidth={GLYPH_PORTHOLE.strokeWidth}
          />
          <path d={GLYPH_BODY[5].d} style={{ fill: GLYPH_BODY[5].fill }} />
        </svg>
      </g>
    </svg>
  );
}
