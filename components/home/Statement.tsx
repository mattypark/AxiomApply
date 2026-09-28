"use client";

import { useEffect, useRef } from "react";

/**
 * Moonshot's "Say it. / See what happens." beat, read with the scroll: the
 * section pins for a stretch, and its words light up one after another —
 * faint to full — as you scroll through it. Scroll back and they dim again.
 *
 * The words are written straight to the DOM from one rAF-throttled scroll
 * handler (opacity only), never through React state. Reduced motion shows the
 * text at full strength and does not pin.
 */

const LINES: { text: string; className: string }[] = [
  { text: "Apply once.", className: "block" },
  { text: "We take it from there.", className: "block pl-[12%] text-ms-green" },
];

const BODY =
  "No portal, no cover letter, no queue. A person reads it, and if it fits, the founder hears about you from us.";

/** How dim a word is before its turn. */
const FAINT = 0.12;

export function Statement() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const words = Array.from(section.querySelectorAll<HTMLElement>("[data-word]"));
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const word of words) word.style.opacity = "1";
      return;
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const span = Math.max(1, section.offsetHeight - window.innerHeight);
      // 0 as the pinned stretch begins, 1 as it ends; words finish at 85% so
      // the whole sentence sits lit for a moment before it scrolls away.
      const progress = Math.min(1, Math.max(0, -rect.top / span)) / 0.85;
      const lit = progress * words.length;
      words.forEach((word, index) => {
        const t = Math.min(1, Math.max(0, lit - index));
        word.style.opacity = String(FAINT + (1 - FAINT) * t);
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

  const word = (text: string, key: string) => (
    <span key={key} data-word className="transition-opacity duration-150" style={{ opacity: FAINT }}>
      {text}{" "}
    </span>
  );

  return (
    <section
      ref={sectionRef}
      id="how"
      className="relative scroll-mt-24 bg-white motion-safe:h-[220svh]"
    >
      <div className="flex min-h-svh items-center px-6 sm:px-[6.5%] motion-safe:sticky motion-safe:top-0 motion-safe:h-svh">
        <div className="mx-auto w-full max-w-[100rem]">
          <h2 className="ms-display text-[clamp(3.2rem,8.2vw,7.2rem)] text-ms-ink">
            <span className="sr-only">Apply once. We take it from there.</span>
            {LINES.map((line, lineIndex) => (
              <span key={line.text} aria-hidden="true" className={line.className}>
                {line.text.split(" ").map((text, index) => word(text, `${lineIndex}-${index}`))}
              </span>
            ))}
          </h2>
          <p
            aria-hidden="true"
            className="mt-10 max-w-[34ch] pl-[12%] text-[clamp(1.1rem,1.5vw,1.3rem)] leading-[1.45] text-ms-body"
          >
            {BODY.split(" ").map((text, index) => word(text, `b-${index}`))}
          </p>
          <p className="sr-only">{BODY}</p>
        </div>
      </div>
    </section>
  );
}
