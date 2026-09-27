/**
 * The dot sphere behind the hero headline.
 *
 * Two arcs of small dots sweeping down the left and right of the viewport, so
 * the sky reads as curved rather than as a flat gradient. Dense on the arc,
 * scattering as it leaves.
 *
 * Positions come from a seeded generator rather than Math.random: this renders
 * on the server and again on the client, and a different scatter each time is
 * a hydration mismatch. Same seed, same sky, every render.
 */

const DOTS_ON_ARC = 420;
const DOTS_SCATTERED = 140;
const CENTER = { x: 500, y: 470 };
const RADIUS = 452;

/** Mulberry32 — small, fast, and identical on both sides of hydration. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type Dot = { x: number; y: number; r: number; o: number };

function buildDots(): Dot[] {
  const random = seeded(20260914);
  const dots: Dot[] = [];

  for (let i = 0; i < DOTS_ON_ARC; i += 1) {
    // Biased toward the sides: the arc should be densest where it sweeps past
    // the headline, and near-empty across the top where the nav sits.
    const t = i / DOTS_ON_ARC;
    const angle = (-60 + t * 300) * (Math.PI / 180);
    const jitter = (random() - 0.5) * 46;
    const radius = RADIUS + jitter;

    dots.push({
      x: CENTER.x + Math.cos(angle) * radius,
      y: CENTER.y + Math.sin(angle) * radius,
      r: 1.1 + random() * 1.9,
      o: 0.18 + random() * 0.72,
    });
  }

  for (let i = 0; i < DOTS_SCATTERED; i += 1) {
    const angle = random() * Math.PI * 2;
    const radius = RADIUS - 120 + random() * 260;
    dots.push({
      x: CENTER.x + Math.cos(angle) * radius,
      y: CENTER.y + Math.sin(angle) * radius,
      r: 0.9 + random() * 1.3,
      o: 0.08 + random() * 0.3,
    });
  }

  return dots;
}

/**
 * Rounded to hundredths. Server and browser trig can disagree in the last
 * floating-point digit, and inside a client component that one digit is a
 * hydration mismatch on every dot. Nobody can see a hundredth of a unit.
 */
const round = (value: number) => Math.round(value * 100) / 100;

const DOTS = buildDots().map((dot) => ({
  x: round(dot.x),
  y: round(dot.y),
  r: round(dot.r),
  o: round(dot.o),
}));

export function DotArc({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 1000"
      preserveAspectRatio="xMidYMid slice"
      className={`pointer-events-none absolute inset-0 h-full w-full ${className}`}
    >
      {DOTS.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={dot.r}
          fill="#ffffff"
          opacity={dot.o}
        />
      ))}
    </svg>
  );
}
