import { randomInvestor } from "@/lib/investor-logos";

/**
 * Click the product rocket and an investor's mark shoots out of its nose: a
 * white card that pops, arcs up and away with a spin, and fades. The marks
 * come from lib/investor-logos.ts, picked at random.
 */

const FLIGHT_MS = 1300;

export function burstLogo(host: HTMLElement, event: { clientX: number; clientY: number }) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const box = host.getBoundingClientRect();
  // From the nose: the upper middle of the box, nudged toward the click.
  const x = box.width / 2 + (event.clientX - box.left - box.width / 2) * 0.2;
  const y = box.height * 0.32;

  const card = document.createElement("div");
  card.setAttribute("aria-hidden", "true");
  card.style.cssText = [
    "position:absolute",
    `left:${x}px`,
    `top:${y}px`,
    "z-index:5",
    "pointer-events:none",
    "display:grid",
    "place-items:center",
    "height:56px",
    "padding:0 18px",
    "border-radius:999px",
    "background:#ffffff",
    "box-shadow:0 14px 30px -12px rgb(23 25 28 / 0.35)",
    "will-change:transform,opacity",
  ].join(";");
  const img = document.createElement("img");
  img.src = randomInvestor().href;
  img.alt = "";
  img.style.cssText = "height:30px;width:auto;max-width:150px;object-fit:contain";
  card.append(img);
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
