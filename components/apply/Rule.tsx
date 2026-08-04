"use client";

import { useEffect } from "react";

/**
 * The line-fill system.
 *
 * Every rule on the apply page — field underlines and section dividers — is a
 * `<Rule />`. It renders at `scaleX(0)` and fills when it scrolls into view,
 * with `transform-origin` alternating left / right down the column so the
 * direction flips line to line.
 *
 * Only `transform` animates, so the whole thing stays on the compositor.
 * `prefers-reduced-motion` skips the animation and paints the lines filled —
 * handled in CSS, so there is no flash before JS boots.
 */

type RuleProps = {
  /** Visual weight. "divider" is the heavier line between sections. */
  variant?: "field" | "divider";
  /** Focus/active state pulls the line to full ink. */
  active?: boolean;
  className?: string;
};

export function Rule({ variant = "field", active, className = "" }: RuleProps) {
  return (
    <span
      aria-hidden="true"
      data-apply-rule=""
      data-active={active ? "" : undefined}
      className={`apply-rule ${
        variant === "divider" ? "apply-rule-divider" : ""
      } ${className}`}
    />
  );
}

/**
 * Drives every `[data-apply-rule]` inside `root`. GSAP + ScrollTrigger are
 * imported dynamically so they stay out of the initial bundle, and the whole
 * effect no-ops under reduced motion (CSS already painted the lines in).
 */
export function useLineFill(root: React.RefObject<HTMLElement | null>, deps: unknown[] = []) {
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup = () => {};
    let cancelled = false;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        // Scoped to the root: the form column and the media panel scroll
        // independently, so each owns its rules and its own scroller.
        const rules = Array.from(
          element.querySelectorAll<HTMLElement>("[data-apply-rule]"),
        );

        rules.forEach((rule, index) => {
          gsap.set(rule, {
            scaleX: 0,
            transformOrigin: index % 2 === 0 ? "left center" : "right center",
          });
        });

        ScrollTrigger.batch(rules, {
          // The column itself is the scroll container, not the window.
          scroller: element,
          start: "top 92%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, {
              scaleX: 1,
              duration: 0.5,
              ease: "expo.out",
              stagger: 0.045,
              overwrite: true,
            }),
        });
      }, element);

      cleanup = () => context.revert();
    })();

    return () => {
      cancelled = true;
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
