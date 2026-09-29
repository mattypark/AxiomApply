import { fitLogo, randomInvestor } from "@/lib/investor-logos";

/**
 * Click the product rocket and an investor's mark shoots out of its nose: the
 * bare, transparent logo pops, arcs up and away with a spin, and fades. The
 * marks come from lib/investor-logos.ts, picked at random.
 */

const FLIGHT_MS = 1300;

export function burstLogo(host: HTMLElement, event: { clientX: number; clientY: number }) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const box = host.getBoundingClientRect();
  // From the nose: the upper middle of the box, nudged toward the click.
  const x = box.width / 2 + (event.clientX - box.left - box.width / 2) * 0.2;
  const y = box.height * 0.32;

  const investor = randomInvestor();
  const { width, height } = fitLogo(investor, 150, 46);
  const card = document.createElement("img");
  card.src = investor.href;
  card.alt = "";
  card.setAttribute("aria-hidden", "true");
  card.style.cssText = [
    "position:absolute",
    `left:${x}px`,
    `top:${y}px`,
    `width:${width}px`,
    `height:${height}px`,
    "z-index:5",
    "pointer-events:none",
    // A soft lift so a dark mark still reads against the rocket.
    "filter:drop-shadow(0 6px 10px rgb(23 25 28 / 0.18))",
    "will-change:transform,opacity",
  ].join(";");
  host.append(card);

  const side = Math.random() > 0.5 ? 1 : -1;
  const dx = side * (60 + Math.random() * 120);
  const dy = -(box.height * 0.28 + Math.random() * box.height * 0.12);
  const spin = side * (12 + Math.random() * 20);
  const animation = card.animate(
    [
      // Easing per step: a springy pop out of the nose, a glide, then a fade.
      { transform: "translate(-50%, -50%) scale(0.3)", opacity: 0, easing: "cubic-bezier(0.34, 1.56, 0.64, 1)" },
      { transform: "translate(-50%, -80%) scale(1.08)", opacity: 1, offset: 0.18, easing: "ease-out" },
      {
        transform: `translate(calc(-50% + ${dx * 0.6}px), calc(-50% + ${dy * 0.75}px)) rotate(${spin * 0.6}deg) scale(1)`,
        opacity: 1,
        offset: 0.62,
        easing: "ease-in",
      },
      {
        transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${spin}deg) scale(0.9)`,
        opacity: 0,
      },
    ],
    { duration: FLIGHT_MS, easing: "linear" },
  );
  animation.onfinish = () => card.remove();
}
