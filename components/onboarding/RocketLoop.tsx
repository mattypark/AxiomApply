"use client";

import { useEffect, useRef } from "react";
import { RocketGlyph } from "@/components/RocketGlyph";
import { GLYPH_NOZZLE } from "@/components/rocket-glyph";
import type { Side } from "@/lib/apply-sides";
import { randomInvestor } from "@/lib/investor-logos";

/**
 * The welcome page's picture: the path as a journey. A small rocket flies a
 * circle through four stops — for an intern, Start → Intern → Full time →
 * Founder → back to Start (a startup: Post → Interview → Hire; a chapter:
 * Found → Recruit → Lead). Each time it lands, that stop's name lights up and
 * its picture pops up in the middle of the circle: an icon, or at an intern's
 * first stop an accelerator's mark, a different one each lap when there are
 * several (lib/investor-logos.ts). Pick another path and the stops change and
 * it starts again from Start.
 *
 * The rocket flies nose-first and leaves real exhaust: puffs that bloom out of
 * the nozzle and fade, with the flame roaring while it moves and idling at a
 * stop. Frames are written straight to the DOM from one rAF loop; React only
 * renders the stops. Reduced motion parks it at Start with every stop named.
 */

type Picture = { icon: string[] } | { investor: true };
type Stop = { name: string; picture: Picture };

// Stroke icons on a 24-unit grid, drawn for this picture.
const ICON = {
  flag: ["M5 21V4", "M5 4h11l-2 4 2 4H5"],
  briefcase: ["M3 8h18v11H3z", "M8 8V5h8v3", "M3 13h18"],
  bulb: [
    "M12 3a6 6 0 0 0-4 10.5c.8.8 1 1.5 1 2.5h6c0-1 .2-1.7 1-2.5A6 6 0 0 0 12 3z",
    "M9 19h6",
    "M10 22h4",
  ],
  megaphone: ["M3 10v4h3l7 4V6l-7 4H3z", "M16 9a4 4 0 0 1 0 6"],
  chat: ["M3 5h12v8H8l-4 3v-3H3z", "M18 9h3v8h-2v3l-4-3h-3"],
  hire: ["M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M2 21a7 7 0 0 1 14 0", "M16 11l2 2 4-4"],
  school: ["M3 10l9-6 9 6", "M5 10v10h14V10", "M10 20v-5h4v5"],
  people: [
    "M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "M2 20a6 6 0 0 1 12 0",
    "M16 11a3 3 0 1 0 0-6",
    "M15 14a6 6 0 0 1 7 6",
  ],
  star: ["M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"],
};

// Bottom, left, top, right — the order the rocket reaches them.
const STOPS: Record<Side, [Stop, Stop, Stop, Stop]> = {
  intern: [
    { name: "Start", picture: { icon: ICON.flag } },
    { name: "Intern", picture: { investor: true } },
    { name: "Full time", picture: { icon: ICON.briefcase } },
    { name: "Founder", picture: { icon: ICON.bulb } },
  ],
  startup: [
    { name: "Start", picture: { icon: ICON.flag } },
    { name: "Post", picture: { icon: ICON.megaphone } },
    { name: "Interview", picture: { icon: ICON.chat } },
    { name: "Hire", picture: { icon: ICON.hire } },
  ],
  chapter: [
    { name: "Start", picture: { icon: ICON.flag } },
    { name: "Found", picture: { icon: ICON.school } },
    { name: "Recruit", picture: { icon: ICON.people } },
    { name: "Lead", picture: { icon: ICON.star } },
  ],
};

/** Wider than tall so the side stops' names fit beside the circle. */
const W = 500;
const H = 460;
const CX = W / 2;
const CY = H / 2;
const R = 130;
// Sweep 1 in SVG's y-down space runs bottom → left → top → right.
const LOOP = `M ${CX} ${CY + R} A ${R} ${R} 0 0 1 ${CX - R} ${CY} A ${R} ${R} 0 0 1 ${CX} ${CY - R} A ${R} ${R} 0 0 1 ${CX + R} ${CY} A ${R} ${R} 0 0 1 ${CX} ${CY + R}`;
const STOP_POINTS = [
  { x: CX, y: CY + R },
  { x: CX - R, y: CY },
  { x: CX, y: CY - R },
  { x: CX + R, y: CY },
];
// Clear of the parked rocket, which lies along the circle: ~48 either way
// along it, ~24 across it.
const LABELS: { x: number; y: number; anchor: "start" | "middle" | "end" }[] = [
  { x: CX, y: CY + R + 64, anchor: "middle" },
  { x: CX - R - 36, y: CY + 8, anchor: "end" },
  { x: CX, y: CY - R - 44, anchor: "middle" },
  { x: CX + R + 36, y: CY + 8, anchor: "start" },
];

/** The investor card in the middle, and the logo's height inside it. */
const CARD = { width: 200, height: 76, logo: 40 };

const TRAVEL_MS = 1200;
const DWELL_MS = 1150;
const LEG_MS = TRAVEL_MS + DWELL_MS;
const ROCKET_H = 96;
const SCALE = ROCKET_H / 120;
/** Nozzle mouth, from the rocket's centre along its tail, in viewbox units. */
const NOZZLE = (GLYPH_NOZZLE.y - 48) * SCALE + 6;

/** The exhaust: a pool of puffs reused round-robin. */
const PUFFS = 44;
const PUFF_EVERY_MS = 20;
const PUFF_LIFE_MS = 900;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function StopPicture({ picture }: { picture: Picture }) {
  if ("investor" in picture) {
    return (
      <>
        <rect
          x={CX - CARD.width / 2}
          y={CY - CARD.height / 2}
          width={CARD.width}
          height={CARD.height}
          rx={CARD.height / 2}
          fill="#ffffff"
        />
        {/* href and width are set each time it shows: a random investor. */}
        <image data-investor x={CX} y={CY - CARD.logo / 2} height={CARD.logo} />
      </>
    );
  }
  return (
    <>
      <circle cx={CX} cy={CY} r={62} fill="#ffffff" />
      <g
        transform={`translate(${CX - 36} ${CY - 36}) scale(3)`}
        fill="none"
        stroke="var(--color-ms-green)"
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {picture.icon.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </>
  );
}

export function RocketLoop({ side, className = "" }: { side: Side; className?: string }) {
  const trackRef = useRef<SVGPathElement>(null);
  const exhaustRef = useRef<SVGGElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const flameRef = useRef<SVGGElement>(null);
  const labelsRef = useRef<(SVGTextElement | null)[]>([]);
  const picturesRef = useRef<(SVGGElement | null)[]>([]);
  const stops = STOPS[side];

  useEffect(() => {
    const track = trackRef.current;
    const exhaust = exhaustRef.current;
    const rocket = rocketRef.current;
    if (!track || !exhaust || !rocket) return;

    const total = track.getTotalLength();
    const puffs = Array.from(exhaust.querySelectorAll<SVGCircleElement>("circle"));
    const born = puffs.map(() => -Infinity);
    let nextPuff = 0;
    let lastPuff = 0;
    let lit = -1;
    let shown = -1;

    const light = (index: number) => {
      if (index === lit) return;
      lit = index;
      labelsRef.current.forEach((label, i) => label?.setAttribute("data-on", String(i === index)));
    };
    // The picture only shows while the rocket sits at its stop.
    const show = (index: number) => {
      if (index === shown) return;
      shown = index;
      const logo = picturesRef.current[index]?.querySelector<SVGImageElement>("[data-investor]");
      if (logo) {
        const investor = randomInvestor();
        const width = (investor.width / investor.height) * CARD.logo;
        logo.setAttribute("href", investor.href);
        logo.setAttribute("width", String(width));
        logo.setAttribute("x", String(CX - width / 2));
      }
      picturesRef.current.forEach((picture, i) => picture?.setAttribute("data-on", String(i === index)));
    };

    /** Where the rocket is, and which way its nose points (unit vector). */
    const at = (distance: number) => {
      const point = track.getPointAtLength(distance);
      const ahead = track.getPointAtLength((distance + 1) % total);
      const dx = ahead.x - point.x;
      const dy = ahead.y - point.y;
      const length = Math.hypot(dx, dy) || 1;
      return { x: point.x, y: point.y, ux: dx / length, uy: dy / length };
    };

    const place = (distance: number, time: number, thrust: number) => {
      const { x, y, ux, uy } = at(distance);
      const angle = (Math.atan2(uy, ux) * 180) / Math.PI + 90;
      rocket.setAttribute(
        "transform",
        `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${angle.toFixed(1)}) scale(${SCALE}) translate(-30 -48)`,
      );
      // The flame roars in flight and idles at a stop.
      const burn = (0.45 + thrust * 1.05) * (1 + Math.sin(time / 40) * 0.14);
      flameRef.current?.setAttribute(
        "transform",
        `translate(${GLYPH_NOZZLE.x} ${GLYPH_NOZZLE.y}) scale(${(0.9 + thrust * 0.25).toFixed(3)} ${burn.toFixed(3)}) translate(${-GLYPH_NOZZLE.x} ${-GLYPH_NOZZLE.y})`,
      );

      // Exhaust: a new puff at the nozzle every few frames while it thrusts.
      if (thrust > 0.15 && time - lastPuff > PUFF_EVERY_MS) {
        lastPuff = time;
        const puff = puffs[nextPuff];
        born[nextPuff] = time;
        const jitter = (Math.random() - 0.5) * 6;
        puff.setAttribute("cx", (x - ux * NOZZLE - uy * jitter).toFixed(1));
        puff.setAttribute("cy", (y - uy * NOZZLE + ux * jitter).toFixed(1));
        puff.dataset.drift = String((Math.random() - 0.5) * 10);
        nextPuff = (nextPuff + 1) % puffs.length;
      }
      puffs.forEach((puff, i) => {
        const age = (time - born[i]) / PUFF_LIFE_MS;
        if (age >= 1 || age < 0) {
          puff.style.opacity = "0";
          return;
        }
        const grow = 1 - (1 - age) ** 2;
        puff.setAttribute("r", (4 + grow * 17).toFixed(1));
        puff.style.opacity = ((1 - age) ** 1.4 * 0.55).toFixed(3);
        puff.style.transform = `translate(0px, ${(Number(puff.dataset.drift) * age).toFixed(1)}px)`;
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      place(0.01, 0, 0);
      labelsRef.current.forEach((label) => label?.setAttribute("data-on", "true"));
      show(0);
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
      // Full thrust mid-flight, easing off on the way in to land.
      const thrust = travel < 1 ? Math.sin(Math.PI * Math.min(1, travel * 1.15)) ** 0.6 : 0;
      place(distance % total, now, thrust);
      const arrived = travel >= 0.97;
      light(arrived ? (leg + 1) % 4 : leg);
      show(arrived ? (leg + 1) % 4 : -1);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [side]);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label={`${stops.map((stop) => stop.name).join(", then ")}, and round again`}
      className={`h-full w-full overflow-visible ${className}`}
    >
      <path
        ref={trackRef}
        d={LOOP}
        fill="none"
        stroke="var(--color-ms-ink)"
        strokeOpacity={0.14}
        strokeWidth={2}
        strokeDasharray="2 9"
        strokeLinecap="round"
      />

      {stops.map((stop, index) => (
        <g
          key={`${side}-${stop.name}-picture`}
          ref={(node) => {
            picturesRef.current[index] = node;
          }}
          data-on="false"
          className="rocket-loop-picture"
        >
          <StopPicture picture={stop.picture} />
        </g>
      ))}

      {STOP_POINTS.map((point, index) => (
        <circle key={index} cx={point.x} cy={point.y} r={5} fill="var(--color-ms-green)" />
      ))}

      {stops.map((stop, index) => (
        <text
          key={`${side}-${stop.name}`}
          ref={(node) => {
            labelsRef.current[index] = node;
          }}
          x={LABELS[index].x}
          y={LABELS[index].y}
          textAnchor={LABELS[index].anchor}
          data-on="false"
          className="rocket-loop-stop"
        >
          {stop.name}
        </text>
      ))}

      {/* A light blur melts the puffs into one plume. */}
      <g ref={exhaustRef} style={{ filter: "blur(2.5px)" }}>
        {Array.from({ length: PUFFS }, (_, index) => (
          <circle
            key={index}
            r={0}
            style={{ opacity: 0, fill: index % 3 === 0 ? "var(--color-ms-sky)" : "var(--launch-smoke-lit)" }}
          />
        ))}
      </g>

      <g ref={rocketRef}>
        <RocketGlyph flameRef={flameRef} />
      </g>
    </svg>
  );
}
