"use client";

import { useEffect, useRef } from "react";

/**
 * The atmosphere behind the glass. Two oversized radial blobs
 * (forest + warm ink) drift on slow GSAP loops so every glass
 * surface has something to refract. Fixed, behind everything.
 */
export function AmbientBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !rootRef.current) return;

    let ctx: { revert: () => void } | undefined;
    let cancelled = false;

    import("gsap").then(({ gsap }) => {
      if (cancelled || !rootRef.current) return;
      ctx = gsap.context(() => {
        gsap.to("[data-blob='a']", {
          xPercent: 22,
          yPercent: 16,
          scale: 1.15,
          duration: 46,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to("[data-blob='b']", {
          xPercent: -18,
          yPercent: -12,
          scale: 0.9,
          duration: 58,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
        gsap.to("[data-blob='c']", {
          xPercent: 12,
          yPercent: -20,
          duration: 64,
          ease: "sine.inOut",
          repeat: -1,
          yoyo: true,
        });
      }, rootRef);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden"
    >
      <div
        data-blob="a"
        className="backdrop-blob"
        style={{
          top: "-12%",
          left: "-8%",
          width: "55vw",
          height: "55vw",
          background: "rgba(47, 107, 61, 0.10)",
        }}
      />
      <div
        data-blob="b"
        className="backdrop-blob"
        style={{
          bottom: "-18%",
          right: "-10%",
          width: "60vw",
          height: "60vw",
          background: "rgba(21, 21, 15, 0.06)",
        }}
      />
      <div
        data-blob="c"
        className="backdrop-blob"
        style={{
          top: "30%",
          right: "18%",
          width: "34vw",
          height: "34vw",
          background: "rgba(63, 143, 82, 0.07)",
        }}
      />
    </div>
  );
}
