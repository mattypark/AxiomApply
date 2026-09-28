"use client";

import { useEffect, useRef } from "react";
import { RocketGlyph } from "@/components/RocketGlyph";
import { GLYPH_NOZZLE } from "@/components/rocket-glyph";

/**
 * Moonshot's "Say it. / See what happens." beat, played by the scroll while
 * the section is pinned, everything centred:
 *
 *   1. "Apply" slides up and fades in, then "once."
 *   2. Scrolling on, the two words swirl apart and fade away.
 *   3. "We take it from there" rises in, in a faded grey. A rocket flies in
 *      along the baseline, drawing an underline behind it; each word takes
 *      the path colour as the rocket passes under it, and the rocket lands
 *      upright after "there" — it is the full stop.
 *
 * Everything is written to the DOM from one rAF-throttled scroll handler,
 * transform/opacity/filter only. Positions come from offsetLeft/offsetTop,
 * which ignore transforms, and are re-measured on resize. Reduced motion
 * shows the finished state, unpinned.
 */

const FIRST = ["Apply", "once."];
const SECOND = "We take it from there".split(" ");

/** Rocket height in em of the second line: flying, then parked as the stop. */
const ROCKET_FLY_EM = 0.5;
const ROCKET_STOP_EM = 0.46;

const clamp = (v: number) => Math.min(1, Math.max(0, v));
/** Progress through [from, to], 0–1. */
const seg = (p: number, from: number, to: number) => clamp((p - from) / (to - from));
const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
const lit = (t: number) =>
  `color-mix(in oklab, var(--path-lit) ${Math.round(t * 100)}%, var(--path-unlit))`;

export function Statement() {
  const sectionRef = useRef<HTMLElement>(null);
  const firstRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const stopRef = useRef<HTMLSpanElement>(null);
  const rocketRef = useRef<HTMLDivElement>(null);
  const underlineRef = useRef<HTMLDivElement>(null);
  const flameRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const first = firstRef.current;
    const line = lineRef.current;
    const stop = stopRef.current;
    const rocket = rocketRef.current;
    const underline = underlineRef.current;
    if (!section || !first || !line || !stop || !rocket || !underline) return;

    if (flameRef.current) flameRef.current.style.transformOrigin = `${GLYPH_NOZZLE.x}px ${GLYPH_NOZZLE.y}px`;
    const firstWords = Array.from(first.querySelectorAll<HTMLElement>("[data-word]"));
    const words = Array.from(line.querySelectorAll<HTMLElement>("[data-word]"));

    // Geometry of the second line, in its own box.
    let em = 100;
    let startX = 0;
    let flyY = 0;
    let stopX = 0;
    let stopY = 0;
    let centres: number[] = [];
    const measure = () => {
      em = parseFloat(getComputedStyle(line).fontSize) || 100;
      const lastTop = words[words.length - 1].offsetTop;
      const lastLine = words.filter((word) => word.offsetTop === lastTop);
      startX = lastLine[0].offsetLeft;
      // The stop marker is an empty inline-block, so its top is the baseline.
      stopX = stop.offsetLeft + stop.offsetWidth / 2;
      stopY = stop.offsetTop;
      // The underline runs just under the baseline.
      flyY = stopY + 0.1 * em;
      centres = words.map((word) =>
        word.offsetTop === lastTop ? word.offsetLeft + word.offsetWidth / 2 : -Infinity,
      );
    };

    const placeRocket = (x: number, y: number, angle: number, heightEm: number) => {
      const h = heightEm * em;
      rocket.style.height = `${h}px`;
      rocket.style.width = `${h / 2}px`;
      rocket.style.transform = `translate3d(${(x - h / 4).toFixed(1)}px, ${(y - h / 2).toFixed(1)}px, 0) rotate(${angle.toFixed(1)}deg)`;
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      measure();
      first.style.opacity = "1";
      for (const word of words) word.style.color = lit(1);
      placeRocket(stopX, stopY - ROCKET_STOP_EM * em * 0.5, 0, ROCKET_STOP_EM);
      if (flameRef.current) flameRef.current.style.opacity = "0";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const span = Math.max(1, section.offsetHeight - vh);
      // Starts while the section is still coming up the screen, so the first
      // word is already rising by the time it pins.
      const p = clamp((vh * 0.55 - rect.top) / (vh * 0.55 + span));

      // 1 · "Apply", then "once.", slide up and in.
      // 2 · Then they swirl apart and fade.
      const swirl = easeInOut(seg(p, 0.3, 0.44));
      firstWords.forEach((word, index) => {
        const rise = easeOut(seg(p, 0.02 + index * 0.08, 0.12 + index * 0.08));
        const dir = index === 0 ? -1 : 1;
        word.style.opacity = String(rise * (1 - swirl));
        word.style.filter = swirl > 0 ? `blur(${(swirl * 10).toFixed(1)}px)` : "";
        word.style.transform =
          `translate3d(${(dir * swirl * 0.9 * em).toFixed(1)}px, ${((1 - rise) * 0.5 * em - swirl * 0.6 * em).toFixed(1)}px, 0) ` +
          `rotate(${(dir * swirl * 70).toFixed(1)}deg) scale(${(1 - swirl * 0.45).toFixed(3)})`;
      });
      first.style.transform = `rotate(${(-swirl * 18).toFixed(1)}deg)`;

      // 3 · The second line rises in, grey.
      words.forEach((word, index) => {
        const rise = easeOut(seg(p, 0.42 + index * 0.025, 0.52 + index * 0.025));
        word.style.opacity = String(rise);
        word.style.transform = `translate3d(0, ${((1 - rise) * 0.4 * em).toFixed(1)}px, 0)`;
      });

      // The rocket flies in along the baseline, drawing the underline…
      const fly = easeInOut(seg(p, 0.55, 0.84));
      const land = easeInOut(seg(p, 0.84, 0.92));
      const fromX = startX - 1.2 * em;
      const x = fromX + (stopX - fromX) * fly;
      const y = flyY + (stopY - ROCKET_STOP_EM * em * 0.5 - flyY) * land;
      const heightEm = ROCKET_FLY_EM + (ROCKET_STOP_EM - ROCKET_FLY_EM) * land;
      placeRocket(x, y, 90 * (1 - land), heightEm);
      rocket.style.opacity = fly > 0 ? "1" : "0";
      if (flameRef.current) {
        flameRef.current.style.opacity = String(1 - land);
        flameRef.current.style.transform = `scaleY(${(1 + Math.sin(p * 400) * 0.15).toFixed(3)})`;
      }
      const drawn = Math.max(0, Math.min(x, stopX) - startX);
      underline.style.left = `${startX}px`;
      underline.style.top = `${flyY}px`;
      underline.style.width = `${Math.max(1, stopX - startX)}px`;
      underline.style.transform = `scaleX(${(drawn / Math.max(1, stopX - startX)).toFixed(4)})`;
      underline.style.opacity = String(1 - land * 0.35);

      // …and each word lights up as the rocket passes under it. Words on an
      // earlier line (phones) light as the flight begins.
      words.forEach((word, index) => {
        const centre = centres[index];
        const t = centre === -Infinity ? fly * 3 : (x - centre) / (0.6 * em) + 0.5;
        word.style.color = lit(clamp(t));
      });
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      onScroll();
    };

    measure();
    update();
    // Web fonts change the widths once they land.
    document.fonts?.ready.then(onResize).catch(() => {});
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section ref={sectionRef} id="how" className="relative scroll-mt-24 bg-white motion-safe:h-[340svh]">
      <div className="flex min-h-svh flex-col items-center justify-center gap-10 px-6 sm:px-[6.5%] motion-safe:sticky motion-safe:top-0 motion-safe:h-svh motion-safe:gap-0">
        <h2 className="sr-only">Apply once. We take it from there.</h2>

        <div
          ref={firstRef}
          aria-hidden="true"
          className="ms-display text-center text-[clamp(3.4rem,9vw,8.4rem)] text-ms-ink motion-safe:absolute"
        >
          {FIRST.map((text, index) => (
            <span key={index} data-word className="inline-block motion-safe:opacity-0">
              {text}
              {index < FIRST.length - 1 ? " " : null}
            </span>
          ))}
        </div>

        <div
          ref={lineRef}
          aria-hidden="true"
          className="ms-display relative max-w-[100rem] text-center text-[clamp(3rem,7.2vw,7.6rem)] leading-[1.02]"
        >
          {SECOND.map((text, index) => (
            <span key={index} data-word className="inline-block motion-safe:opacity-0" style={{ color: lit(0) }}>
              {text}
              {index < SECOND.length - 1 ? " " : null}
            </span>
          ))}
          {/* Where the full stop would be; the rocket lands here. */}
          <span ref={stopRef} className="ml-[0.06em] inline-block w-[0.26em]" />
          <div
            ref={underlineRef}
            className="absolute h-[0.045em] origin-left rounded-full"
            style={{ background: "var(--path-em)", transform: "scaleX(0)" }}
          />
          <div ref={rocketRef} className="absolute top-0 left-0 opacity-0 will-change-transform">
            <RocketGlyph flameRef={flameRef} width="100%" height="100%" />
          </div>
        </div>
      </div>
    </section>
  );
}
