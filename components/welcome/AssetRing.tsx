"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * The orbiting ring around the drop target.
 *
 * Two founder tiles 180° apart, each with a comet tail of network startups
 * trailing behind it. The ring turns clockwise, so "behind" is the smaller
 * angle — chips sit at decreasing angles from their founder and fade out the
 * further back they are.
 *
 * CRITICAL: the placement transform lives on a PLAIN div, never on a
 * motion.div. Framer Motion owns the `transform` property on any element it
 * animates, so putting the spoke transform on a motion.div silently wipes it
 * and every tile collapses onto the centre point. Placement outside, animation
 * inside.
 *
 * Placement chain:
 *   .orbit-ring  turns the whole ring clockwise as one rigid body
 *   spoke        rotate(θ) → translateY(-R) → rotate(-θ) → translate(-50%,-50%)
 *                The rotations cancel, so the final translate runs on page axes
 *                and centres the tile on the ring rather than hanging it off
 *                its own top-left corner.
 *   .orbit-tile  counter-rotates at the ring's period, so photos, captions and
 *                chips all stay upright the whole way round.
 *
 * `focus` is the object-position that keeps each face centred in a portrait
 * crop of a landscape original — adjust it, not the crop, when a photo changes.
 */

const ORBIT = "72s";

/** Degrees from a founder to the first chip behind them. Wide enough that the
    chip clears the photo AND the two-line caption under it. */
const TAIL_LEAD = 58;

/** Degrees between one chip and the next. Two chips per founder over a
    180° arc, so this spaces the ring evenly rather than clustering. */
const TAIL_GAP = 44;

type Founder = {
  name: string;
  role: string;
  src: string;
  focus: string;
  /** Degrees around the ring. */
  angle: number;
};

const FOUNDERS: Founder[] = [
  {
    name: "Matthew",
    role: "Founder",
    src: "/welcome/founders/matthew.jpg",
    focus: "50% 32%",
    // Left and right rather than top and bottom: at 0° the tile starts under
    // the fixed header and the caption collides with the menu pill.
    angle: 270,
  },
  {
    name: "Frank",
    role: "Founder",
    src: "/welcome/founders/frank.jpg",
    focus: "49% 40%",
    angle: 90,
  },
];

/**
 * What trails each founder. Two chips behind one, one plus the roll-up behind
 * the other, so the ring stays uneven rather than symmetrical.
 *
 * Only startups whose real logo we have get a mark; everything else is
 * summarised by the count chip. No invented logos.
 */
type Chip =
  | { kind: "logo"; name: string; src: string; width: number }
  | { kind: "count"; label: string };

const TAILS: Chip[][] = [
  // Behind Matthew.
  [
    { kind: "logo", name: "Corgi", src: "/logos/corgi.png", width: 120 },
    { kind: "logo", name: "TypeOS", src: "/logos/typeos.png", width: 150 },
  ],
  // Behind Frank.
  [
    { kind: "logo", name: "FinalDose", src: "/logos/finaldose.png", width: 140 },
    // Several network startups are YC companies — the mark stands in for the
    // rest of the roster, it does not claim Axiom itself is YC.
    { kind: "logo", name: "Y Combinator", src: "/logos/ycombinator.png", width: 150 },
  ],
];

function spokeTransform(angle: number, radius: number) {
  return `rotate(${angle}deg) translateY(-${radius}px) rotate(${-angle}deg) translate(-50%, -50%)`;
}

/* ------------------------------------------------------------------ */
/* arrival order                                                       */
/* ------------------------------------------------------------------ */

/**
 * Assets land one at a time, left to right across the ring — the arrival in
 * the reference recording, where the leftmost tile is fully settled before the
 * next one starts.
 *
 * Order is derived from geometry, not hand-numbered: at angle θ a spoke sits
 * at x = R·sin(θ), so sorting on sin(θ) is sorting on screen position. Move a
 * founder or retune TAIL_GAP and the sequence re-sorts itself instead of
 * silently animating in the old order.
 */
const ARRIVAL_START = 0.35;
const ARRIVAL_STEP = 0.22;

function arrivalDelays(): Map<string, number> {
  const spokes: { key: string; x: number }[] = [];

  FOUNDERS.forEach((founder, founderIndex) => {
    spokes.push({
      key: founder.name,
      x: Math.sin((founder.angle * Math.PI) / 180),
    });

    TAILS[founderIndex]?.forEach((chip, tailIndex) => {
      const angle = founder.angle - TAIL_LEAD - TAIL_GAP * tailIndex;
      spokes.push({
        key: chip.kind === "logo" ? chip.name : chip.label,
        x: Math.sin((angle * Math.PI) / 180),
      });
    });
  });

  spokes.sort((a, b) => a.x - b.x);

  return new Map(
    spokes.map((spoke, index) => [
      spoke.key,
      ARRIVAL_START + index * ARRIVAL_STEP,
    ]),
  );
}

const ARRIVAL = arrivalDelays();

/** Rotation in degrees from an element's computed matrix, or null if unset. */
function angleOf(element: Element): number | null {
  const match = getComputedStyle(element).transform.match(/matrix\(([^)]+)\)/);
  if (!match) return null;

  const [a, b] = match[1].split(",").map(Number);
  return (Math.atan2(b, a) * 180) / Math.PI;
}

/**
 * Keep every tile's counter-rotation in phase with the ring.
 *
 * The upright effect depends on two separate CSS animations sharing a start
 * time. They do not: a tile that mounts (or remounts — Fast Refresh, a parent
 * re-render, a lazily-decoded image) after the ring begins turning starts its
 * counter-rotation from 0 and the photo sits permanently tilted by however far
 * the ring had already travelled.
 *
 * So read the ring's real angle out of its computed matrix and offset each
 * tile's animation by that much. `animation-delay` is negative here, which
 * seeks the animation forward rather than delaying it.
 */
function useOrbitSync(ringRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    let frame = 0;

    const sync = () => {
      const degrees = angleOf(ring);
      if (degrees === null) {
        // Animation has not painted a matrix yet — try again next frame.
        frame = requestAnimationFrame(sync);
        return;
      }

      const normalised = ((degrees % 360) + 360) % 360;

      const duration =
        parseFloat(getComputedStyle(ring).animationDuration) || 72;
      const tiles = ring.querySelectorAll<HTMLElement>(".orbit-tile");

      const applied = (normalised / 360) * duration;
      tiles.forEach((tile) => {
        tile.style.animationDelay = `${-applied}s`;
      });

      // One correction pass. Reading and writing happen a frame apart, so the
      // first offset is always a couple of degrees stale — measure what
      // actually landed and fold the remainder in.
      frame = requestAnimationFrame(() => {
        const first = tiles[0];
        if (!first) return;

        const ringAngle = angleOf(ring);
        const tileAngle = angleOf(first);
        if (ringAngle === null || tileAngle === null) return;

        const residual = ringAngle + tileAngle;
        const corrected = applied + (residual / 360) * duration;

        tiles.forEach((tile) => {
          tile.style.animationDelay = `${-corrected}s`;
        });
      });
    };

    frame = requestAnimationFrame(sync);
    return () => cancelAnimationFrame(frame);
  });
}

/**
 * The ring sizes itself off its container instead of trusting the prop.
 *
 * A fixed pixel radius is fine at 1440 and catastrophic at 390: the spokes
 * push every tile past the viewport edge, which is exactly what the phone was
 * doing — logos half off-screen and one sitting under the header. The prop is
 * now a MAXIMUM; the real radius is whatever fits.
 *
 * Everything else scales off that measured radius, so tiles and logos shrink
 * with the ring rather than staying desktop-sized inside a phone-sized circle.
 */
function useFittedRadius(
  ref: React.RefObject<HTMLDivElement | null>,
  max: number,
) {
  const [radius, setRadius] = useState(max);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () => {
      const width = element.offsetWidth;
      if (width > 0) setRadius(Math.min(max, width * 0.46));
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, max]);

  return radius;
}

export function AssetRing({ radius: maxRadius = 240 }: { radius?: number }) {
  const ringRef = useRef<HTMLDivElement>(null);
  const radius = useFittedRadius(ringRef, maxRadius);
  /** 1 at full size, smaller as the ring shrinks. Drives tile + logo sizing. */
  const scale = radius / maxRadius;
  useOrbitSync(ringRef);

  return (
    <div
      ref={ringRef}
      className="orbit-ring pointer-events-none absolute inset-0"
      style={{ ["--orbit-duration" as string]: ORBIT }}
      aria-hidden="true"
    >
      {FOUNDERS.map((founder, founderIndex) => (
        <div key={founder.name}>
          <div
            className="absolute top-1/2 left-1/2"
            style={{ transform: spokeTransform(founder.angle, radius) }}
          >
            <div
              className="orbit-tile"
              style={{ ["--orbit-duration" as string]: ORBIT }}
            >
              <motion.div
                // Blur-in, not a scale pop: the reference resolves each asset
                // out of focus rather than punching it in.
                initial={{ opacity: 0, scale: 0.94, filter: "blur(14px)" }}
                animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                transition={{
                  delay: ARRIVAL.get(founder.name) ?? 0.35,
                  duration: 0.75,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="flex flex-col items-center"
              >
                <div
                  className="orbit-shape overflow-hidden shadow-[0_6px_18px_rgba(21,21,15,0.07)]"
                  style={{
                    ["--morph-duration" as string]: `${16 + founderIndex * 2.5}s`,
                    animationDelay: `${founderIndex * -1.7}s`,
                    width: Math.round(radius * 0.5),
                    height: Math.round(radius * 0.625),
                  }}
                >
                  <img
                    src={founder.src}
                    alt=""
                    loading="eager"
                    decoding="async"
                    className="h-full w-full object-cover"
                    style={{ objectPosition: founder.focus }}
                  />
                </div>

                <p
                  className="wel-fg mt-3 text-center leading-tight font-medium tracking-tight"
                  style={{ fontSize: `${Math.max(0.62, 0.82 * scale)}rem` }}
                >
                  {founder.name}
                </p>
                <p
                  className="wel-fg-soft mt-0.5 text-center font-mono tracking-[0.18em] uppercase"
                  style={{ fontSize: `${Math.max(0.46, 0.6 * scale)}rem` }}
                >
                  {founder.role}
                </p>
              </motion.div>
            </div>
          </div>

          {TAILS[founderIndex]?.map((chip, tailIndex) => {
            // Clockwise ring, so subtracting angle puts the chip behind.
            const angle = founder.angle - TAIL_LEAD - TAIL_GAP * tailIndex;
            // Fade down the tail, never to nothing.
            const opacity = 0.9 - tailIndex * 0.18;
            const key = chip.kind === "logo" ? chip.name : chip.label;

            return (
              <div
                key={key}
                className="absolute top-1/2 left-1/2"
                style={{ transform: spokeTransform(angle, radius) }}
              >
                <div
                  className="orbit-tile"
                  style={{ ["--orbit-duration" as string]: ORBIT }}
                >
                  <motion.span
                    initial={{ opacity: 0, scale: 0.94, filter: "blur(12px)" }}
                    animate={{ opacity, scale: 1, filter: "blur(0px)" }}
                    transition={{
                      delay: ARRIVAL.get(key) ?? 0.5,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    // Bare marks, no bubble — the pill made the logos read
                    // low-quality and cramped.
                    className="wel-fg flex items-center justify-center whitespace-nowrap"
                  >
                    {chip.kind === "logo" ? (
                      <img
                        src={chip.src}
                        alt={chip.name}
                        loading="lazy"
                        decoding="async"
                        style={{ width: Math.round(chip.width * scale) }}
                        className="h-auto object-contain"
                      />
                    ) : (
                      <span
                        className="leading-none font-semibold tracking-tight"
                        style={{ fontSize: `${Math.max(1, 1.9 * scale)}rem` }}
                      >
                        {chip.label}
                      </span>
                    )}
                  </motion.span>
                </div>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
