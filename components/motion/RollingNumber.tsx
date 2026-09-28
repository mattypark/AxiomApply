"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

/**
 * klinn's counter: every digit is a 0–9 column that rolls into place the first
 * time the number scrolls into view. Commas stay put.
 *
 * Before hydration (and with reduced motion) the columns already sit on the
 * real digits, so the number is correct in the HTML and to a screen reader —
 * the roll only ever starts from zero once JavaScript is there to finish it.
 * The visible columns are aria-hidden; the real value is in an sr-only span.
 */
export function RollingNumber({
  value,
  className = "",
  bounceEvery,
}: {
  value: number;
  className?: string;
  /**
   * Once rolled in, the digits give a small staggered hop every N ms — alive,
   * never distracting. Off when omitted, and always off under reduced motion.
   */
  bounceEvery?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [armed, setArmed] = useState(false);
  const [shown, setShown] = useState(false);
  const [beat, setBeat] = useState(0);
  const text = value.toLocaleString("en-US");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    setArmed(true);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        // One frame at zero first, so the transition has somewhere to start.
        requestAnimationFrame(() => setShown(true));
        observer.disconnect();
      },
      { threshold: 0.6 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Re-keying the digit row replays its CSS bounce; the roll itself is not
  // replayed, because the columns remount already sitting on their digits.
  useEffect(() => {
    if (!shown || !bounceEvery) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setBeat((n) => n + 1), bounceEvery);
    return () => window.clearInterval(timer);
  }, [shown, bounceEvery]);

  return (
    <span ref={ref} className={`inline-flex leading-[1] tabular-nums ${className}`}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex" key={beat}>
        {text.split("").map((char, index) => {
          const hop = beat > 0 ? "ax-hop" : "";
          const delay = { animationDelay: `${index * 70}ms` };
          if (!/\d/.test(char)) {
            return (
              <span key={index} className={`inline-block ${hop}`} style={delay}>
                {char}
              </span>
            );
          }
          const digit = armed && !shown ? 0 : Number(char);
          return (
            <span key={index} className={`inline-block h-[1lh] overflow-hidden ${hop}`} style={delay}>
              <span
                className="ax-roll"
                style={{ "--digit": digit, "--roll-delay": `${index * 70}ms` } as CSSProperties}
              >
                {Array.from({ length: 10 }, (_, n) => (
                  <span key={n}>{n}</span>
                ))}
              </span>
            </span>
          );
        })}
      </span>
    </span>
  );
}
