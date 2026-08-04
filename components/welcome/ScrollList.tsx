"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * The stacked statement list from the reference's "How It Works" band
 * (frame 1000): each row is a full-width rule with an oversized phrase, and
 * the row nearest the middle of the viewport is inked while the rest sit
 * greyed. Driven by ScrollTrigger, one trigger per row.
 */
export function ScrollList({ items }: { items: readonly string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const rows = gsap.utils.toArray<HTMLElement>("[data-row]", el);

      rows.forEach((row) => {
        const target = row.querySelector("[data-row-text]");
        if (!target) return;

        gsap.set(target, { color: "var(--wel-fg-soft)" });

        ScrollTrigger.create({
          trigger: row,
          start: "top 62%",
          end: "bottom 38%",
          onToggle: ({ isActive }) =>
            gsap.to(target, {
              color: isActive ? "var(--wel-fg)" : "var(--wel-fg-soft)",
              duration: 0.45,
              ease: "power2.out",
            }),
        });
      });
    }, el);

    return () => ctx.revert();
  }, [items]);

  return (
    <div ref={ref} className="flex flex-col">
      {items.map((item) => (
        <div
          key={item}
          data-row
          className="border-t border-current/10 py-8 first:border-t-0 sm:py-12"
        >
          <p
            data-row-text
            className="text-[clamp(2rem,6vw,4.6rem)] leading-[1.05] font-semibold tracking-[-0.03em]"
          >
            {item}
          </p>
        </div>
      ))}
    </div>
  );
}
