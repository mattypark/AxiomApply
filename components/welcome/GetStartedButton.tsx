"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";

/**
 * Pill CTA with the reference's hover: the label rolls UP character by
 * character while a duplicate rolls in from below — the
 * hover-stagger effect (js/hover-stagger.js), not a scramble. The pill fills
 * with the accent colour at the same time.
 *
 * Two stacked copies of the label live inside an overflow mask; on hover both
 * translate up one line with a per-character stagger, so the original leaves
 * exactly as the label arrives.
 */

const ACCENT = "#2f6b3d";
const STAGGER = 0.02;
const DURATION = 0.2;

export function GetStartedButton({
  href = "/onboarding",
  label = "Get started",
}: {
  href?: string;
  label?: string;
}) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const maskRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const mask = maskRef.current;
    if (!root || !mask) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chars = mask.querySelectorAll<HTMLElement>("[data-char]");

    const timeline = gsap.timeline({
      paused: true,
      defaults: { ease: "power1.inOut", duration: DURATION, stagger: STAGGER },
    });
    timeline.to(chars, { yPercent: -100 });

    const enter = () => {
      gsap.to(root, { backgroundColor: ACCENT, duration: 0.32, ease: "power2.out" });
      if (!reduced) timeline.restart();
    };
    const leave = () => {
      gsap.to(root, { backgroundColor: "", duration: 0.42, ease: "power2.out" });
      if (!reduced) timeline.reverse();
    };

    root.addEventListener("mouseenter", enter);
    root.addEventListener("mouseleave", leave);
    root.addEventListener("focus", enter);
    root.addEventListener("blur", leave);

    return () => {
      root.removeEventListener("mouseenter", enter);
      root.removeEventListener("mouseleave", leave);
      root.removeEventListener("focus", enter);
      root.removeEventListener("blur", leave);
      timeline.kill();
    };
  }, [label]);

  return (
    <Link
      ref={rootRef}
      href={href}
      className="wel-pill inline-flex items-center rounded-full px-5 py-3 text-[0.95rem] font-medium sm:px-8 sm:py-4 sm:text-[1.05rem] shadow-[0_10px_30px_rgba(21,21,15,0.22)] transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:text-white hover:shadow-[0_16px_44px_rgba(47,107,61,0.34)]"
    >
      <span
        ref={maskRef}
        aria-label={label}
        className="inline-block overflow-hidden whitespace-pre leading-[1.2]"
        style={{
          // Crop to the text band so the rolling copies never poke out.
          WebkitMaskImage: "linear-gradient(#000 0 0)",
          maskImage: "linear-gradient(#000 0 0)",
        }}
      >
        {label.split("").map((character, index) => (
          <span
            key={`${character}-${index}`}
            aria-hidden="true"
            className="relative inline-block"
          >
            <span data-char className="block">
              {character}
            </span>
            <span data-char className="absolute top-full left-0 block">
              {character}
            </span>
          </span>
        ))}
      </span>
    </Link>
  );
}
