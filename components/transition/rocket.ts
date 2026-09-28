import { gsap } from "gsap";
import { glyphSvg } from "@/components/rocket-glyph";

/**
 * The launch — the page transition as a rocket blasting off.
 *
 * A small green rocket (components/rocket-glyph.ts) fires up from
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

const FILL_S = 1.35;
const DRAIN_S = 1;

// The path colour (PATH COLOUR in app/globals.css): green, blue or near-black.
const SMOKE = "var(--launch-smoke)";
const SMOKE_DEEP = "var(--launch-smoke-deep)";
const SMOKE_LIT = "var(--launch-smoke-lit)";

/** The rocket sits on the pad, flame building, until this share of the fill… */
const IGNITE = 0.16;
/** …and leaves the top of the screen at this one. */
const ROCKET_EXIT = 0.72;
/** The cloud starts to rise once the rocket is clear of the pad. */
const CLOUD_START = 0.08;
/** Launch curve: <2 so it clears the pad quickly but still visibly accelerates. */
const THRUST = 1.7;
/** Where the body starts inside the plume, in edge-puff radii… */
const BODY_TOP = 1.1;
/** …and how deep its top fades in, so it never shows a straight line. */
const BODY_FADE = 0.4;
/** Plume offset (in R) at which the body is solid at the screen's top. */
const COVERED = BODY_TOP + BODY_FADE + 0.08;

const ROCKET_SVG = glyphSvg();

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
/** Where the rocket stands before liftoff: its nose in view, its base below the fold. */
const padY = (h: number, rocketH: number) => h - rocketH * 0.72;

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeOut = (t: number) => 1 - (1 - t) ** 3;

/** Slow swirl for puff `i` at time `now` (s): drift and a breath, scaled by `amount`. */
function churn(i: number, now: number, R: number, amount: number) {
  return {
    dx: Math.sin(now * 1.5 + i * 1.37) * R * 0.22 * amount,
    dy: Math.cos(now * 1.2 + i * 0.83) * R * 0.16 * amount,
    s: 1 + Math.sin(now * 1.9 + i * 2.1) * 0.07 * amount,
  };
}

/** A colour (a CSS var here) at some opacity. */
function tint(color: string, alpha: number) {
  return `color-mix(in srgb, ${color} ${Math.round(alpha * 100)}%, transparent)`;
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
  const rocketH = small ? 132 : 190;
  const random = seeded(7);

  // The cloud: a solid body with a billowing top edge, translated up as one.
  const plume = document.createElement("div");
  plume.style.cssText = `position:absolute;left:0;top:0;width:${w}px;height:${h + R * 2}px;will-change:transform`;
  const body = document.createElement("div");
  // Its top sits under the edge puffs and fades in, so no straight line shows.
  body.style.cssText = `position:absolute;left:0;right:0;top:${R * BODY_TOP}px;bottom:0;background:linear-gradient(180deg, ${tint(SMOKE, 0)} 0px, ${SMOKE} ${R * BODY_FADE}px)`;
  plume.append(body);

  const edge: Puff[] = [];
  const edgeCount = Math.ceil(w / (R * 0.95)) + 2;
  for (let i = 0; i < edgeCount; i += 1) {
    const r = R * (0.8 + random() * 0.45);
    // The first sits just inside the left edge so the body never peeks there.
    const x = (i - 0.3) * (w / (edgeCount - 2)) + (random() - 0.5) * R * 0.3;
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
  const startY = padY(h, rocketH);
  const endY = -rocketH * 1.6;
  for (let i = 0; i < trailCount; i += 1) {
    const y = h * (1 - (i + 0.5) / trailCount) + (random() - 0.5) * 20;
    const r = (small ? 34 : 46) * (0.8 + random() * 0.6);
    const x = w / 2 + (random() - 0.5) * 24;
    // Nozzle sits ~0.95 of the rocket's height below its top.
    const q = clamp((y - rocketH * 0.95 - startY) / (endY - startY));
    const el = puffEl(r, random() > 0.5 ? "lit" : "deep");
    root.append(el);
    trail.push({ el, x, y, r, side: random() > 0.5 ? 1 : -1, speed: 0.6 + random() * 0.8, born: IGNITE + q ** (1 / THRUST) * (ROCKET_EXIT - IGNITE), delay: 0 });
  }
  // Ignition: puffs at the pad that burst out sideways while the rocket
  // is still sitting there, before the cloud proper has risen into view.
  const padCount = small ? 8 : 12;
  for (let i = 0; i < padCount; i += 1) {
    const side = i % 2 === 0 ? -1 : 1;
    const r = (small ? 44 : 64) * (0.8 + random() * 0.6);
    const el = puffEl(r, random() > 0.5 ? "lit" : "deep");
    root.append(el);
    trail.push({
      el,
      x: w / 2 + side * random() * 30,
      y: h - random() * 24,
      r,
      side,
      speed: 2 + random() * 2.2,
      born: (i / padCount) * IGNITE,
      delay: 0,
    });
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

    // Rocket: rumbles on the pad while the flame builds, then accelerates
    // away and is gone by ROCKET_EXIT.
    const igniting = p < IGNITE;
    const q = clamp((p - IGNITE) / (ROCKET_EXIT - IGNITE));
    const startY = padY(h, rocketH);
    const endY = -rocketH * 1.6;
    const y = startY + (endY - startY) * q ** THRUST;
    const shake = Math.sin(p * 220) * (igniting ? 2.6 : 1.2);
    rocket.style.transform = `translate3d(${(w / 2 - rocketH / 4 + shake).toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    rocket.style.opacity = q >= 1 ? "0" : "1";
    const burn = igniting ? 0.35 + 0.65 * (p / IGNITE) : 1 + q * 0.5;
    if (flame) flame.style.transform = `scaleY(${(burn + Math.sin(p * 90) * 0.18).toFixed(3)})`;

    // Cloud: rises from below the screen until its edge band clears the top.
    const level = easeInOut(clamp((p - CLOUD_START) / (1 - CLOUD_START)));
    const plumeY = h + R * 0.4 + (-R * COVERED - (h + R * 0.4)) * level;
    plume.style.transform = `translate3d(0, ${plumeY.toFixed(1)}px, 0)`;
    plume.style.opacity = "1";
    body.style.opacity = "1";

    // The edge boils: each puff swells in as it comes up, and keeps churning.
    const now = performance.now() / 1000;
    for (const [i, puff] of edge.entries()) {
      const c = churn(i, now, R, easeOut(level));
      place(puff.el, puff.x + c.dx, puff.y + c.dy, puff.r, (0.55 + 0.45 * easeOut(level)) * c.s);
      puff.el.style.opacity = "1";
    }
    for (const [i, puff] of inner.entries()) {
      const c = churn(i + 50, now, R, easeOut(level));
      place(puff.el, puff.x + c.dx, puff.y + c.dy, puff.r, c.s);
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

    // It clears from the churning state, so nothing freezes at the handover.
    const now = performance.now() / 1000;
    for (const [i, puff] of [...edge, ...inner].entries()) {
      const t = clamp((d - puff.delay) / 0.5);
      const c = churn(i < edge.length ? i : i - edge.length + 50, now, R, 1);
      const x = puff.x + c.dx + puff.side * puff.speed * t * 60;
      const y = puff.y + c.dy - puff.speed * t * h * 0.18;
      place(puff.el, x, y, puff.r, c.s * (1 + easeOut(t) * 0.35));
      puff.el.style.opacity = (1 - easeOut(t)).toFixed(3);
    }
  };

  let mode: "fill" | "drain" = "fill";
  const draw = () => (mode === "fill" ? drawFill() : drawDrain());

  // Frames come from gsap's ticker for as long as the smoke is up — through
  // the fill, the wait for the next page, and the clear — so the cloud keeps
  // churning while the route loads instead of freezing on the last frame.
  let running = false;
  const run = () => {
    if (running) return;
    running = true;
    gsap.ticker.add(draw);
  };
  const stop = () => {
    running = false;
    gsap.ticker.remove(draw);
  };

  const fill = (onComplete: () => void) => {
    gsap.killTweensOf(state);
    mode = "fill";
    state.fill = 0;
    state.drain = 0;
    root.style.visibility = "visible";
    drawFill();
    run();
    gsap.to(state, { fill: 1, duration: FILL_S, ease: "none", onComplete });
  };

  const drain = (onComplete?: () => void) => {
    gsap.killTweensOf(state);
    mode = "drain";
    state.drain = 0;
    drawDrain();
    run();
    gsap.to(state, {
      drain: 1,
      duration: DRAIN_S,
      ease: "power1.in",
      onComplete: () => {
        stop();
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
        stop();
        mode = phase;
        state[phase] = t;
        root.style.visibility = t >= 1 && phase === "drain" ? "hidden" : "visible";
        draw();
      },
      hide: () => {
        stop();
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
      stop();
      window.removeEventListener("resize", onResize);
      root.replaceChildren();
    },
  };
}
