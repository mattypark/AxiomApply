"use client";

import { useEffect, useRef } from "react";

/**
 * Moonshot's "Say it. / See what happens." beat, read with the scroll: two
 * lines, nothing else. The section pins for a stretch; "Apply once." stays
 * black, and "We take it from there." — set larger — waits in a faded grey
 * and turns light green one word at a time as you scroll through it. Scroll
 * back and the words fade to grey again.
 *
 * Colour is written straight to the DOM from one rAF-throttled scroll
 * handler, never through React state. Reduced motion shows it already green
 * and does not pin.
 */

/** Unlit: a faded grey, so the line reads as waiting to be lit. */
const GREY = [200, 205, 209];
/** Lit: Matthew asked for a light green over the darker 3.4:1 one; at this
 *  display size it is decoration more than body text (about 2:1 on white). */
const GREEN = [124, 196, 147];
const SECOND = "We take it from there.".split(" ");

const mix = (t: number) =>
  `rgb(${GREY.map((from, i) => Math.round(from + (GREEN[i] - from) * t)).join(" ")})`;

export function Statement() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const words = Array.from(section.querySelectorAll<HTMLElement>("[data-word]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const word of words) word.style.color = mix(1);
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, section.offsetHeight - window.innerHeight);
      // Words finish turning at 80% of the pinned stretch, so the line sits
      // fully green for a moment before it scrolls away.
      const progress = Math.min(1, Math.max(0, -rect.top / span)) / 0.8;
      const lit = progress * words.length;
      words.forEach((word, index) => {
        word.style.color = mix(Math.min(1, Math.max(0, lit - index)));
      });
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section ref={sectionRef} id="how" className="relative scroll-mt-24 bg-white motion-safe:h-[190svh]">
      <div className="flex min-h-svh items-center px-6 sm:px-[6.5%] motion-safe:sticky motion-safe:top-0 motion-safe:h-svh">
        <h2 className="mx-auto w-full max-w-[100rem] text-ms-ink">
          <span className="ms-display block text-[clamp(3.2rem,8.2vw,7.2rem)]">Apply once.</span>
          <span className="ms-display mt-2 block pl-[8%] text-[clamp(3.8rem,10.5vw,9.8rem)] leading-[0.92]">
            {SECOND.map((text, index) => (
              <span key={index} data-word style={{ color: mix(0) }}>
                {text}{" "}
              </span>
            ))}
          </span>
        </h2>
      </div>
    </section>
  );
}
