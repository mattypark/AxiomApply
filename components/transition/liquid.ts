import { gsap } from "gsap";

/**
 * The liquid fill — ported from Matthew's portfolio (matthewportfolio
 * src/life/board/liquid.js), where it pours between the whiteboard's boxes.
 *
 * Two SVG paths rise from the bottom of the screen to cover it: a darker back
 * wave and the main front wave. The top edge is a sine wave whose amplitude
 * swells mid-fill and flattens at the ends, so the liquid sloshes in and
 * settles. Drain runs it back down.
 */

const POINTS = 12;
const FILL_S = 0.9;
const DRAIN_S = 0.75;

function wavePath(w: number, h: number, level: number, amp: number, phase: number) {
  // level: 0 = empty (edge at the bottom), 1 = full (edge above the top)
  const edge = h - level * (h + amp * 2) + amp;
  let d = `M 0 ${h} L 0 ${edge.toFixed(1)}`;
  for (let i = 1; i <= POINTS; i += 1) {
    const x = (w / POINTS) * i;
    const y = edge + Math.sin((i / POINTS) * Math.PI * 2 + phase) * amp;
    const cx = x - w / POINTS / 2;
    const cy = edge + Math.sin(((i - 0.5) / POINTS) * Math.PI * 2 + phase) * amp * 1.35;
    d += ` Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d} L ${w} ${h} Z`;
}

export type Liquid = {
  fill: (onComplete: () => void) => void;
  drain: (onComplete?: () => void) => void;
  destroy: () => void;
};

export function createLiquid(svg: SVGSVGElement, back: SVGPathElement, front: SVGPathElement): Liquid {
  const state = { level: 0, phase: 0 };

  const draw = () => {
    const w = window.innerWidth;
    const h = window.innerHeight;
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    const swell = Math.sin(Math.PI * Math.min(1, Math.max(0, state.level)));
    const amp = 18 + 46 * swell;
    front.setAttribute("d", wavePath(w, h, state.level, amp, state.phase));
    // The back wave leads slightly and is offset in phase: depth.
    back.setAttribute("d", wavePath(w, h, Math.min(1.04, state.level * 1.06), amp * 0.9, state.phase + 1.6));
  };

  const fill = (onComplete: () => void) => {
    gsap.killTweensOf(state);
    svg.style.visibility = "visible";
    gsap
      .timeline({ onUpdate: draw, onComplete })
      .to(state, { level: 1.02, duration: FILL_S, ease: "power2.inOut" }, 0)
      .to(state, { phase: `+=${Math.PI * 2.4}`, duration: FILL_S, ease: "none" }, 0);
  };

  const drain = (onComplete?: () => void) => {
    gsap.killTweensOf(state);
    gsap
      .timeline({
        onUpdate: draw,
        onComplete: () => {
          svg.style.visibility = "hidden";
          onComplete?.();
        },
      })
      .to(state, { level: 0, duration: DRAIN_S, ease: "power3.in" }, 0)
      .to(state, { phase: `-=${Math.PI * 1.8}`, duration: DRAIN_S, ease: "none" }, 0);
  };

  const onResize = () => draw();
  window.addEventListener("resize", onResize);
  draw();

  return {
    fill,
    drain,
    destroy: () => {
      gsap.killTweensOf(state);
      window.removeEventListener("resize", onResize);
    },
  };
}
