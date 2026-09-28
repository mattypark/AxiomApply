"use client";

import { useEffect, useRef } from "react";
import { CHAPTERS } from "@/components/rocket/chapters";

/**
 * The story, told beside a pinned 3D stage (desktop), or as plain chapters
 * (phones and tablets, where no canvas is mounted).
 *
 * Desktop layout: the section is one screen tall per chapter. The left half is
 * a sticky stage — a dark card with a ring that fills as you scroll and the
 * chapter list beside it — and RocketScene draws the particle object centred
 * on that card. The right half scrolls: one chapter per screen, and only the
 * chapter at the centre of the screen shows its text, which rises in line by
 * line while the object holds its shape. That hold is the pause.
 *
 * The scroll handler writes straight to the DOM (a stroke offset and a few
 * data attributes) rather than into React state — it runs every frame, and
 * re-rendering the section sixty times a second would be the slowest thing on
 * the page.
 */

const RING_RADIUS = 46;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

export function StorySection() {
  const sectionRef = useRef<HTMLElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const chapters = Array.from(section.querySelectorAll<HTMLElement>("[data-chapter]"));
    const labels = Array.from(section.querySelectorAll<HTMLElement>("[data-chapter-label]"));
    let frame = 0;
    let active = -1;

    const update = () => {
      frame = 0;
      const top = section.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const span = Math.max(1, section.offsetHeight - vh);
      const progress = Math.min(1, Math.max(0, -top / span));
      const current = Math.min(CHAPTERS.length - 1, Math.max(0, Math.round(-top / vh)));

      ringRef.current?.setAttribute("stroke-dashoffset", String(RING_LENGTH * (1 - progress)));

      if (current !== active) {
        active = current;
        chapters.forEach((node, index) => {
          node.dataset.active = String(index === current);
        });
        labels.forEach((node, index) => {
          node.dataset.active = String(index === current);
          node.dataset.past = String(index < current);
        });
        if (counterRef.current) {
          counterRef.current.textContent = String(current + 1).padStart(2, "0");
        }
      }
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
    <section
      ref={sectionRef}
      data-story
      aria-label="how axiom works, in six steps"
      className="relative lg:grid lg:grid-cols-2"
      style={{ ["--chapters" as string]: CHAPTERS.length }}
    >
      {/* The stage. Desktop only; the canvas centres the object on it. */}
      <div className="hidden lg:block">
        <div className="sticky top-0 h-svh pt-[84px] pb-[var(--hero-inset)] pl-[var(--hero-inset)]">
          <div
            data-story-stage
            className="relative h-full overflow-hidden rounded-[var(--radius-hero)]"
            style={{
              background:
                "radial-gradient(60% 55% at 50% 50%, rgb(19 105 47 / 0.35) 0%, transparent 70%), radial-gradient(80% 60% at 50% 115%, rgb(42 148 71 / 0.55) 0%, transparent 70%), linear-gradient(180deg, #000603 0%, #00140a 100%)",
            }}
          >
            {/* The ring: fills with the whole story's progress. */}
            <svg
              aria-hidden="true"
              viewBox="0 0 100 100"
              className="absolute top-1/2 left-1/2 h-[66%] max-h-[92%] w-auto -translate-x-1/2 -translate-y-1/2 -rotate-90 overflow-visible"
              style={{ aspectRatio: "1 / 1" }}
            >
              <circle cx="50" cy="50" r={RING_RADIUS} fill="none" stroke="rgb(255 255 255 / 0.08)" strokeWidth="0.35" />
              <circle
                ref={ringRef}
                cx="50"
                cy="50"
                r={RING_RADIUS}
                fill="none"
                stroke="#6fcf8a"
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH}
                className="transition-[stroke-dashoffset] duration-300 ease-out"
              />
            </svg>

            {/* The chapter list, read like a dial. */}
            <ol className="absolute top-1/2 right-[3.5%] flex -translate-y-1/2 flex-col gap-2.5 text-right">
              {CHAPTERS.map((chapter) => (
                <li
                  key={chapter.id}
                  data-chapter-label
                  className="text-[12px] text-white/35 transition-[color,transform] duration-500 ease-mask data-[active=true]:-translate-x-1.5 data-[active=true]:font-medium data-[active=true]:text-white data-[past=true]:text-white/60"
                >
                  {chapter.label}
                </li>
              ))}
            </ol>

            <p className="absolute bottom-7 left-8 font-display text-[40px] leading-none text-white">
              <span ref={counterRef}>01</span>
              <span className="text-white/35">/{String(CHAPTERS.length).padStart(2, "0")}</span>
            </p>
            <p className="absolute top-7 left-8 text-[13px] text-white/60">the axiom path</p>
          </div>
        </div>
      </div>

      {/* The chapters. One screen each on desktop; a plain list below it. */}
      <div>
        {CHAPTERS.map((chapter, index) => (
          <article
            key={chapter.id}
            data-chapter
            data-active={index === 0}
            className="story-chapter mx-auto flex max-w-[49.5rem] items-center px-6 py-14 lg:mx-0 lg:h-svh lg:max-w-none lg:px-[8%] lg:py-0"
          >
            <div className="max-w-[26rem]">
              <p className="story-rise flex items-center gap-2 text-body-small" style={{ ["--rise" as string]: "0ms" }}>
                <span className="text-accent">{String(index + 1).padStart(2, "0")}</span>
                <span className="text-muted">/ {chapter.label}</span>
              </p>
              <h2
                className="story-rise mt-4 font-display text-title-h2 text-loud"
                style={{ ["--rise" as string]: "90ms" }}
              >
                {chapter.title[0]}
                <em className="italic">{chapter.title[1]}</em>
              </h2>
              <p className="story-rise mt-4 text-body-large text-muted" style={{ ["--rise" as string]: "180ms" }}>
                {chapter.body}
              </p>
              <p
                className="story-rise mt-7 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[13px] text-loud shadow-[0_0_0_1px_var(--color-border-faint),0_4px_12px_-6px_rgba(4,36,16,0.12)]"
                style={{ ["--rise" as string]: "300ms" }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                {chapter.detail}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
