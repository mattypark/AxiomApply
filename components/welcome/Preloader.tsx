"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Welcome preloader, built against the reference frames in (
 * js/preloader.js) against the reference frames in
 * ~/Documents/Reference images/axiom-preloader-frames:
 *
 *   top-left      counter stepping 0 → 100, resolving to the word "Connected"
 *   centre        the stepped 8-dot spinner (steps(8), one tick per 125ms)
 *   bottom-right  the Axiom mark
 *
 * Everything blurs in with a stagger, holds, blurs out, then the overlay
 * unmounts and hands the page to the hero intro. Returning visitors get the
 * whole thing at 5× speed with "Connected" straight away — same trick as the
 * reference. Scroll is locked while it runs.
 */

const VISIT_KEY = "ax_preloader_v1";
const COUNTER_STEPS = [0, 11, 24, 39, 51, 67, 78, 89, 96, 100];
const COUNTER_DURATION = 4.2;

/** How long the fully-revealed screen holds before blurring out. */
const HOLD_SECONDS = 3.4;

export function Preloader() {
  const [isDone, setIsDone] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setIsDone(true);
      return;
    }

    const isReturning = localStorage.getItem(VISIT_KEY) === "1";
    const speed = isReturning ? 1 / 5 : 1;
    try {
      localStorage.setItem(VISIT_KEY, "1");
    } catch {
      /* private mode */
    }

    window.scrollTo(0, 0);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    const unlock = () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };

    const numberEl = root.querySelector<HTMLElement>("[data-pre-number]");

    // Counter → "Connected". Returning visitors skip straight to the word.
    if (numberEl) {
      if (isReturning) {
        numberEl.textContent = "Connected";
        gsap.fromTo(
          numberEl,
          { opacity: 0, y: 8, filter: "blur(6px)" },
          { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.2, delay: 0.1, ease: "power2.out" },
        );
      } else {
        const counter = gsap.timeline({ delay: 0.5 });
        const legDuration = COUNTER_DURATION / (COUNTER_STEPS.length - 1);

        COUNTER_STEPS.forEach((value, index) => {
          const previous = index === 0 ? 0 : COUNTER_STEPS[index - 1];
          counter.to(
            { n: previous },
            {
              n: value,
              duration: legDuration,
              ease: "power2.out",
              onUpdate() {
                numberEl.textContent = String(
                  Math.round((this.targets()[0] as { n: number }).n),
                );
              },
            },
          );
        });
        counter.call(() => {
          numberEl.textContent = "Connected";
        });
      }
    }

    const parts = root.querySelectorAll(":scope > *");
    const timeline = gsap.timeline({
      onComplete: () => {
        gsap.delayedCall(1 * speed, unlock);
        setIsDone(true);
      },
    });

    timeline.set(parts, { visibility: "visible" });
    timeline.fromTo(
      parts,
      { opacity: 0, filter: "blur(20px)" },
      { opacity: 1, filter: "blur(0px)", duration: 1 * speed, stagger: 0.05 * speed, ease: "power2.out" },
    );
    timeline.to(parts, {
      opacity: 0,
      filter: "blur(20px)",
      duration: 1 * speed,
      delay: HOLD_SECONDS * speed,
      stagger: 0.05 * speed,
      ease: "power2.in",
    });
    timeline.to(root, { opacity: 0, duration: 0.6 * speed, ease: "power2.in" });

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
      className="wel-bg pointer-events-none fixed inset-0 z-[9999] flex flex-col items-start justify-between p-8"
    >
      {/* top-left — counter, then "Connected" */}
      <div
        data-pre-number
        className="wel-fg invisible text-[clamp(2.6rem,6vw,5.5rem)] leading-none font-semibold tracking-[-0.03em] tabular-nums"
      >
        0
      </div>

      {/* centre — the stepped spinner is the focal point */}
      <div className="pointer-events-none invisible absolute inset-0 flex items-center justify-center">
        <span
          className="wel-fg block h-20 w-20"
          style={{ animation: "spinStep 1s steps(8) infinite" }}
        >
          <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" className="h-full w-full">
            <g fill="currentColor">
              <circle cx="16" cy="4" r="2.4" />
              <circle cx="24.5" cy="7.5" r="2.4" opacity=".85" />
              <circle cx="28" cy="16" r="2.4" opacity=".7" />
              <circle cx="24.5" cy="24.5" r="2.4" opacity=".55" />
              <circle cx="16" cy="28" r="2.4" opacity=".4" />
              <circle cx="7.5" cy="24.5" r="2.4" opacity=".3" />
              <circle cx="4" cy="16" r="2.4" opacity=".2" />
              <circle cx="7.5" cy="7.5" r="2.4" opacity=".12" />
            </g>
          </svg>
        </span>
      </div>

      {/* bottom-right — the Axiom mark */}
      <div className="invisible flex w-full items-end justify-end">
        <img
          src="/axiom-mark.png"
          alt=""
          width={56}
          height={56}
          className="h-14 w-14 object-contain"
        />
      </div>
    </div>
  );
}
