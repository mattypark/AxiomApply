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
 * circle through four stops — for an intern, Start → Intern → Full time →
 * Founder → back to Start (a startup: Post → Interview → Hire; a chapter:
 * Found → Recruit → Lead). Each time it lands, that stop's name lights up and
 * its picture pops up in the middle of the circle: an icon, or for an intern's
 * first stop, the startups in the network. Pick another path and the stops
 * change and it starts again from Start.
 *
 * The rocket stays upright and only banks into the turns. Frames are written
 * straight to the DOM from one rAF loop; React only renders the stops.
 * Reduced motion parks it at Start with every stop named.
 */

type Picture = { icon: string[] } | { logos: true };
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
    { name: "Intern", picture: { logos: true } },
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

/** Startups already named on the site (lib/site-data.ts): the file's pixel
 *  size, the part of it that is logo (TypeOS ships with wide margins), and
 *  how tall to draw that part. */
const LOGOS = [
  { href: "/logos/finaldose.png", file: [320, 93], crop: [0, 0, 320, 93], height: 32 },
  { href: "/logos/typeos.png", file: [320, 213], crop: [70, 72, 180, 46], height: 30 },
  { href: "/logos/corgi.png", file: [320, 180], crop: [0, 0, 320, 180], height: 46 },
];

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
// Clear of the parked rocket: its nose reaches ~38 above a stop, its flame
// ~58 below, and it is ~24 either side.
const LABELS: { x: number; y: number; anchor: "start" | "middle" | "end" }[] = [
  { x: CX, y: CY + R + 80, anchor: "middle" },
  { x: CX - R - 36, y: CY + 8, anchor: "end" },
  { x: CX, y: CY - R - 54, anchor: "middle" },
  { x: CX + R + 36, y: CY + 8, anchor: "start" },
];

const TRAVEL_MS = 1200;
const DWELL_MS = 1150;
const LEG_MS = TRAVEL_MS + DWELL_MS;
const ROCKET_H = 96;
/** Most the rocket leans into a turn, in degrees. */
const BANK = 24;
/** How much of the loop behind the rocket shows as exhaust, as a fraction. */
const TRAIL = 0.14;

const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

function StopPicture({ picture }: { picture: Picture }) {
  if ("logos" in picture) {
    const gap = 16;
    let y = CY - (LOGOS.reduce((sum, logo) => sum + logo.height, 0) + gap * (LOGOS.length - 1)) / 2;
    return (
      <>
        <rect x={CX - 82} y={CY - 76} width={164} height={152} rx={28} fill="#ffffff" />
        {LOGOS.map(({ href, file, crop, height }) => {
          const width = (crop[2] / crop[3]) * height;
          const top = y;
          y += height + gap;
          return (
            <svg
              key={href}
              x={CX - width / 2}
              y={top}
              width={width}
              height={height}
              viewBox={crop.join(" ")}
            >
              <image href={href} width={file[0]} height={file[1]} />
            </svg>
          );
        })}
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
  const trailRef = useRef<SVGPathElement>(null);
  const rocketRef = useRef<SVGGElement>(null);
  const flameRef = useRef<SVGGElement>(null);
  const labelsRef = useRef<(SVGTextElement | null)[]>([]);
  const picturesRef = useRef<(SVGGElement | null)[]>([]);
  const stops = STOPS[side];

  useEffect(() => {
    const track = trackRef.current;
    const trail = trailRef.current;
    const rocket = rocketRef.current;
    if (!track || !trail || !rocket) return;

    const total = track.getTotalLength();
    const scale = ROCKET_H / 120;
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
      picturesRef.current.forEach((picture, i) => picture?.setAttribute("data-on", String(i === index)));
    };

    const place = (distance: number, time: number) => {
      const at = track.getPointAtLength(distance);
      const ahead = track.getPointAtLength((distance + 1) % total);
      const heading = ahead.x - at.x;
      const lean = Math.max(-1, Math.min(1, heading)) * BANK;
      rocket.setAttribute(
        "transform",
        `translate(${at.x.toFixed(1)} ${at.y.toFixed(1)}) rotate(${lean.toFixed(1)}) scale(${scale}) translate(-30 -48)`,
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
      place(distance % total, now);
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
      <path
        ref={trailRef}
        d={LOOP}
        fill="none"
        stroke="var(--launch-body)"
        strokeOpacity={0.35}
        strokeWidth={7}
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
