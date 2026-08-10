"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * The opening moment: the logo arrives, then the page blooms out of it.
 *
 * There is no counter, no spinner and no loading language — the site is fast
 * enough that announcing a wait invents one. The lockup slides up into the
 * exact spot it occupies in the hero, holds for a beat, then scales up and
 * dissolves so the hero underneath reads as having emerged from inside it.
 *
 * Timing is shared with the hero through INTRO_MS: everything on the welcome
 * screen delays its own entrance by that long, so the bloom is one continuous
 * gesture rather than two animations that happen to overlap.
 *
 * Returning visitors get a much shorter version, and reduced-motion skips it.
 */

/** Total time before the hero starts its own entrance. */
export const INTRO_MS = 1150;

const VISIT_KEY = "ax_intro_v2";

export function Preloader() {
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setIsDone(true);
      return;
    }

    const isReturning = localStorage.getItem(VISIT_KEY) === "1";
    const speed = isReturning ? 0.45 : 1;
    try {
      localStorage.setItem(VISIT_KEY, "1");
    } catch {
      /* private mode */
    }

    // Hold the scroll position while the intro plays.
    document.documentElement.style.overflow = "hidden";
    const unlock = () => {
      document.documentElement.style.overflow = "";
    };

    const mark = root.querySelector("[data-intro-mark]");

    const timeline = gsap.timeline({
      onComplete: () => {
        unlock();
        setIsDone(true);
      },
    });

    // 1 — slide up into place.
    timeline.fromTo(
      mark,
      { opacity: 0, y: 44, scale: 0.86 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.72 * speed,
        ease: "expo.out",
      },
    );

    // 2 — a beat, then open outward. Scaling past the viewport while fading is
    //     what sells "everything came out of the logo": the hero is already
    //     behind it, revealed as the mark expands off the edges.
    timeline.to(mark, {
      scale: 1.9,
      opacity: 0,
      duration: 0.5 * speed,
      ease: "power2.in",
      delay: 0.16 * speed,
    });

    timeline.to(root, { opacity: 0, duration: 0.2 * speed }, "<0.2");

    return () => {
      timeline.kill();
      unlock();
    };
  }, []);

  if (isDone) return null;

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="wel-bg pointer-events-none fixed inset-0 z-[9999] grid place-items-center"
    >
      <img
        data-intro-mark
        src="/axiom-lockup.png"
        alt=""
        width={800}
        height={400}
        className="h-auto w-[min(58vw,360px)] object-contain opacity-0"
      />
    </div>
  );
}
