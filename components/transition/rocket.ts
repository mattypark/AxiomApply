import { gsap } from "gsap";

/**
 * The launch — the page transition as a rocket blasting off.
 *
 * A small green rocket (the product rocket's silhouette, flat) fires up from
 * the bottom of the screen and leaves a trail of exhaust puffs. Behind it the
 * launch cloud piles up off the pad: a solid body of smoke with a billowing
 * edge of big puffs, rising until it covers the screen. The route changes
 * under the cloud; then the cloud thins — the body fades first, so the page
 * shows through the gaps, and the puffs swell, drift up and dissolve.
 *
 * Everything is driven from one progress value per phase and written as
 * transform/opacity only. Puff layout comes from a seeded generator, so every
 * launch looks the same and a resize can rebuild it exactly.
 */

const FILL_S = 0.9;
const DRAIN_S = 0.75;

const SMOKE = "#295337";
const SMOKE_DEEP = "#1a3a27";
const SMOKE_LIT = "#366645";

/** The rocket leaves the top of the screen at this share of the fill. */
const ROCKET_EXIT = 0.62;
/** The cloud starts to rise once the rocket is clear of the pad. */
const CLOUD_START = 0.16;
/** Launch curve: <2 so it clears the pad quickly but still visibly accelerates. */
const THRUST = 1.7;
/** Where the solid body starts inside the plume, in edge-puff radii. */
const BODY_TOP = 1.35;
/** Plume offset (in R) at which the body's top has passed the screen's top. */
const COVERED = BODY_TOP + 0.08;

const ROCKET_SVG = `
<svg viewBox="0 0 60 120" width="100%" height="100%" aria-hidden="true">
  <g data-flame style="transform-origin: 30px 76px">
    <path d="M21 76 Q30 122 39 76 Z" fill="#e2f1e6" opacity="0.95" />
    <path d="M25.5 76 Q30 102 34.5 76 Z" fill="#ffffff" />
  </g>
  <path d="M18 50 L6 72 L8 76 L21 68 Z" fill="#2c5a3c" />
  <path d="M42 50 L54 72 L52 76 L39 68 Z" fill="#2c5a3c" />
  <path d="M30 4 C36 10 43 22 43.6 40 C44 55 42 64 38 70 L22 70 C18 64 16 55 16.4 40 C17 22 24 10 30 4 Z" fill="#3f7a52" />
  <path d="M30 4 C33.5 7.5 36.5 12 38 17 L22 17 C23.5 12 26.5 7.5 30 4 Z" fill="#f6f8f7" />
  <circle cx="30" cy="33" r="5.5" fill="#bfe6ff" stroke="#f6f8f7" stroke-width="2" />
  <path d="M24 70 L36 70 L38 76 L22 76 Z" fill="#2a3130" />
  <path d="M28.6 54 L28.6 77 L31.4 77 L31.4 54 Z" fill="#2c5a3c" />
</svg>`;

type Puff = {
  el: HTMLDivElement;
  /** Centre and radius in px, in the frame of whatever the puff lives in. */
  x: number;
  y: number;
  r: number;
  /** Which way it drifts (−1 left, 1 right) and how fast, 0.6–1.4. */
  side: number;
  speed: number;
  /** Trail puffs: fill progress at which the rocket passes them. */
  born: number;
  /** Drain: when this puff starts to dissolve, 0–0.45. */
  delay: number;
};

type Layout = {
  w: number;
  h: number;
  /** Radius of the cloud's edge puffs; the edge band is 2R deep. */
  R: number;
  rocketH: number;
  plume: HTMLDivElement;
  body: HTMLDivElement;
  edge: Puff[];
  inner: Puff[];
  trail: Puff[];
  rocket: HTMLDivElement;
  flame: SVGGElement | null;
};

export type Launch = {
  fill: (onComplete: () => void) => void;
  drain: (onComplete?: () => void) => void;
  destroy: () => void;
};

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number) => Math.min(1, Math.max(0, v));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** `#rrggbb` + alpha → `rgb(r g b / a)`. */
function tint(hex: string, alpha: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgb(${n >> 16} ${(n >> 8) & 255} ${n & 255} / ${alpha})`;
}

function puffEl(r: number, tone: "lit" | "deep") {
  const el = document.createElement("div");
  const core = tone === "lit" ? SMOKE_LIT : SMOKE_DEEP;
  // A soft rim instead of a hard circle: overlapping puffs melt into one
  // cloud rather than reading as a pile of balls. The offset highlight is
  // the sun catching the top of each billow.
  el.style.cssText = [
    "position:absolute",
    "left:0",
    "top:0",
    `width:${r * 2}px`,
    `height:${r * 2}px`,
    "border-radius:50%",
    `background:radial-gradient(circle at 40% 34%, ${tint(core, 0.75)} 0%, ${tint(core, 0)} 55%), radial-gradient(closest-side, ${SMOKE} 62%, ${tint(SMOKE, 0.85)} 80%, ${tint(SMOKE, 0)} 100%)`,
  ].join(";");
  return el;
}

function place(el: HTMLElement, x: number, y: number, r: number, scale: number) {
  el.style.transform = `translate3d(${(x - r).toFixed(1)}px, ${(y - r).toFixed(1)}px, 0) scale(${scale.toFixed(3)})`;
}

function build(root: HTMLDivElement): Layout {
  root.replaceChildren();
  const w = window.innerWidth;
  const h = window.innerHeight;
  const small = w < 640;
  const R = Math.max(70, Math.min(170, w * 0.11));
  const rocketH = small ? 112 : 150;
  const random = seeded(7);

  // The cloud: a solid body with a billowing top edge, translated up as one.
  const plume = document.createElement("div");
  plume.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h + R * 2}px;will-change:transform`;
  const body = document.createElement("div");
  // Its top sits below the edge puffs' solid cores, so no straight line shows.
  body.style.cssText = `position:absolute;left:0;right:0;top:${R * BODY_TOP}px;bottom:0;background:${SMOKE}`;
  plume.append(body);

  const edge: Puff[] = [];
  const edgeCount = Math.ceil(w / (R * 0.95)) + 2;
  for (let i = 0; i < edgeCount; i += 1) {
    const r = R * (0.8 + random() * 0.45);
    const x = (i - 0.5) * (w / (edgeCount - 2)) + (random() - 0.5) * R * 0.5;
    const y = R + (random() - 0.5) * R * 0.4;
    const el = puffEl(r, random() > 0.3 ? "lit" : "deep");
    plume.append(el);
    edge.push({ el, x, y, r, side: x < w / 2 ? -1 : 1, speed: 0.6 + random() * 0.8, born: 0, delay: 0 });
  }

  // Puffs inside the body: texture while it rises, the cloud itself as it clears.
  const inner: Puff[] = [];
  const cols = small ? 3 : 5;
  const rows = small ? 5 : 4;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const r = Math.max(w / cols, h / rows) * (0.62 + random() * 0.25);
      const x = ((col + 0.5) / cols) * w + (random() - 0.5) * (w / cols) * 0.6;
      // Offset by COVERED so, once the screen is covered, the grid spans it.
      const y = R * COVERED + ((row + 0.5) / rows) * h + (random() - 0.5) * (h / rows) * 0.6;
      const el = puffEl(r, random() > 0.45 ? "lit" : "deep");
      plume.append(el);
      inner.push({ el, x, y, r, side: x < w / 2 ? -1 : 1, speed: 0.6 + random() * 0.8, born: 0, delay: 0 });
    }
  }

  // Clearing starts in the middle and spreads out, like a cloud parting.
  const cx = w / 2;
  const cy = R * COVERED + h / 2;
  const far = Math.hypot(cx, h / 2) || 1;
  for (const puff of [...edge, ...inner]) {
    puff.delay = (Math.hypot(puff.x - cx, puff.y - cy) / far) * 0.4 + random() * 0.05;
  }

  // The exhaust trail: small puffs up the middle, born as the nozzle passes.
  const trail: Puff[] = [];
  const trailCount = small ? 18 : 24;
  const startY = h + rocketH;
  const endY = -rocketH * 1.6;
  for (let i = 0; i < trailCount; i += 1) {
    const y = h * (1 - (i + 0.5) / trailCount) + (random() - 0.5) * 20;
    const r = (small ? 34 : 46) * (0.8 + random() * 0.6);
    const x = w / 2 + (random() - 0.5) * 24;
    // Nozzle sits ~0.95 of the rocket's height below its top.
    const q = clamp((y - rocketH * 0.95 - startY) / (endY - startY));
    const el = puffEl(r, random() > 0.5 ? "lit" : "deep");
    root.append(el);
    trail.push({ el, x, y, r, side: random() > 0.5 ? 1 : -1, speed: 0.6 + random() * 0.8, born: q ** (1 / THRUST) * ROCKET_EXIT, delay: 0 });
  }
  root.prepend(plume);

  const rocket = document.createElement("div");
  rocket.style.cssText = `position:absolute;left:0;top:0;width:${rocketH / 2}px;height:${rocketH}px;will-change:transform`;
  rocket.innerHTML = ROCKET_SVG;
  root.append(rocket);

  return {
    w,
    h,
    R,
    rocketH,
    plume,
    body,
    edge,
    inner,
    trail,
    rocket,
    flame: rocket.querySelector<SVGGElement>("[data-flame]"),
  };
}

export function createLaunch(root: HTMLDivElement): Launch {
  const state = { fill: 0, drain: 0 };
  let layout = build(root);

  const drawFill = () => {
    const { w, h, R, rocketH, plume, body, edge, inner, trail, rocket, flame } = layout;
    const p = state.fill;

    // Rocket: accelerates off the pad and is gone by ROCKET_EXIT.
    const q = clamp(p / ROCKET_EXIT);
    const startY = h + rocketH;
    const endY = -rocketH * 1.6;
    const y = startY + (endY - startY) * q ** THRUST;
    const shake = Math.sin(p * 140) * 1.4;
    rocket.style.transform = `translate3d(${(w / 2 - rocketH / 4 + shake).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    rocket.style.opacity = q >= 1 ? "0" : "1";
    if (flame) flame.style.transform = `scaleY(${(1 + Math.sin(p * 90) * 0.18 + q * 0.4).toFixed(3)})`;

    // Cloud: rises from below the screen until its edge band clears the top.
    const level = easeInOut(clamp((p - CLOUD_START) / (1 - CLOUD_START)));
    const plumeY = h + R * 0.4 + (-R * COVERED - (h + R * 0.4)) * level;
    plume.style.transform = `translate3d(0, ${plumeY.toFixed(1)}px, 0)`;
    plume.style.opacity = "1";
    body.style.opacity = "1";

    // The edge boils: each puff swells in as it comes up, and keeps breathing.
    for (const [i, puff] of edge.entries()) {
      const breathe = 1 + Math.sin(p * 9 + i * 1.7) * 0.05;
      place(puff.el, puff.x, puff.y, puff.r, (0.55 + 0.45 * easeOut(level)) * breathe);
      puff.el.style.opacity = "1";
    }
    for (const puff of inner) {
      place(puff.el, puff.x, puff.y, puff.r, 1);
      puff.el.style.opacity = "1";
    }

    // Trail: each puff pops as the nozzle passes and spreads sideways.
    for (const puff of trail) {
      const age = p - puff.born;
      if (age <= 0) {
        puff.el.style.opacity = "0";
        continue;
      }
      const grow = 0.35 + 0.65 * easeOut(clamp(age / 0.16));
      const x = puff.x + puff.side * puff.speed * age * 90;
      place(puff.el, x, puff.y + age * 40, puff.r, grow * (1 + age * 1.6));
      puff.el.style.opacity = "1";
    }
  };

  const drawDrain = () => {
    const { h, R, plume, body, edge, inner, trail, rocket } = layout;
    const d = state.drain;
    rocket.style.opacity = "0";
    for (const puff of trail) puff.el.style.opacity = "0";

    plume.style.transform = `translate3d(0, ${(-R * COVERED - d * h * 0.12).toFixed(1)}px, 0)`;
    // The solid body goes first, so the page shows through between the puffs.
    body.style.opacity = (1 - clamp(d / 0.3)).toFixed(3);

    for (const puff of [...edge, ...inner]) {
      const t = clamp((d - puff.delay) / 0.5);
      const x = puff.x + puff.side * puff.speed * t * 60;
      const y = puff.y - puff.speed * t * h * 0.18;
      place(puff.el, x, y, puff.r, 1 + easeOut(t) * 0.35);
      puff.el.style.opacity = (1 - easeOut(t)).toFixed(3);
    }
  };

  let mode: "fill" | "drain" = "fill";
  const draw = () => (mode === "fill" ? drawFill() : drawDrain());

  const fill = (onComplete: () => void) => {
    gsap.killTweensOf(state);
    mode = "fill";
    state.fill = 0;
    state.drain = 0;
    root.style.visibility = "visible";
    drawFill();
    gsap.to(state, { fill: 1, duration: FILL_S, ease: "none", onUpdate: drawFill, onComplete });
  };

  const drain = (onComplete?: () => void) => {
    gsap.killTweensOf(state);
    mode = "drain";
    state.drain = 0;
    drawDrain();
    gsap.to(state, {
      drain: 1,
      duration: DRAIN_S,
      ease: "power1.in",
      onUpdate: drawDrain,
      onComplete: () => {
        root.style.visibility = "hidden";
        onComplete?.();
      },
    });
  };

  // Dev only: gsap drives frames from its own rAF, so a headless check cannot
  // freeze a launch from outside. This lets one pose any moment of it.
  if (process.env.NODE_ENV === "development") {
    (window as unknown as { __axiomLaunch?: unknown }).__axiomLaunch = {
      pose: (phase: "fill" | "drain", t: number) => {
        gsap.killTweensOf(state);
        mode = phase;
        state[phase] = t;
        root.style.visibility = t >= 1 && phase === "drain" ? "hidden" : "visible";
        draw();
      },
      hide: () => {
        root.style.visibility = "hidden";
      },
    };
  }

  const onResize = () => {
    layout = build(root);
    draw();
  };
  window.addEventListener("resize", onResize);
  root.style.visibility = "hidden";

  return {
    fill,
    drain,
    destroy: () => {
      gsap.killTweensOf(state);
      window.removeEventListener("resize", onResize);
      root.replaceChildren();
    },
  };
}
