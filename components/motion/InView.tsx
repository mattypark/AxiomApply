"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType, ReactNode } from "react";

type InViewProps = {
  children: ReactNode;
  /** Milliseconds of stagger. Written as a CSS variable, not a JS timer. */
  delay?: number;
  /** How much of the element must be visible before it reveals. */
  amount?: number;
  as?: ElementType;
  className?: string;
};

/**
 * One IntersectionObserver per revealed element, and nothing else.
 *
 * The scroll story used to run through GSAP ScrollTrigger, which meant a
 * scroll handler and a layout read for every section on every frame. Here the
 * observer only flips a data attribute; the transition itself is the CSS in
 * globals.css, so reduced-motion is handled in one place and the resting state
 * is correct before hydration.
 *
 * Reveals are one-way on purpose — re-hiding content on scroll-up reads as a
 * glitch, not as polish.
 */
export function InView({
  children,
  delay = 0,
  amount = 0.2,
  as: Tag = "div",
  className,
}: InViewProps) {
  const ref = useRef<HTMLElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || shown) return;

    // Elements already on screen at mount (the first section) still get the
    // transition — the observer fires immediately and the delay staggers it.
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      { threshold: amount, rootMargin: "0px 0px -10% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, shown]);

  return (
    <Tag
      ref={ref}
      className={className}
      data-inview={shown ? "true" : "false"}
      style={delay ? ({ "--inview-delay": `${delay}ms` } as CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
