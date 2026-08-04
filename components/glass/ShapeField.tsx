"use client";

import { useEffect, useRef } from "react";

/**
 * The signature Axiom backdrop, carried over from the Astro build:
 * a grid of circles / squares / diamonds that pulse open and closed,
 * cleared in the centre so content stays clean, fading in toward the
 * edges. Fixed to the viewport so shapes stay perfectly round.
 */
export function ShapeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const GAP = 38;
    const R = 6;

    type Dot = { x: number; y: number; edge: number; type: number; phase: number };
    let dots: Dot[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    function build() {
      if (!canvas || !ctx) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dots = [];
      const cx = w / 2;
      const cy = h / 2;
      for (let y = GAP / 2; y < h; y += GAP) {
        for (let x = GAP / 2; x < w; x += GAP) {
          // clear ellipse in the centre; shapes fade IN outward
          const dx = (x - cx) / (w * 0.26);
          const dy = (y - cy) / (h * 0.3);
          const vis = Math.min(Math.max((Math.hypot(dx, dy) - 1) / 1.3, 0), 1);
          if (vis <= 0.02) continue;
          const type = (Math.round(x / GAP) + Math.round(y / GAP)) % 3; // 0 circle, 1 square, 2 diamond
          dots.push({ x, y, edge: vis, type, phase: x * 0.05 + y * 0.045 });
        }
      }
    }

    function shape(type: number, x: number, y: number, s: number) {
      if (!ctx) return;
      if (type === 0) {
        ctx.beginPath();
        ctx.arc(x, y, s, 0, Math.PI * 2);
        ctx.fill();
      } else if (type === 1) {
        ctx.fillRect(x - s, y - s, s * 2, s * 2);
      } else {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(Math.PI / 4);
        ctx.fillRect(-s, -s, s * 2, s * 2);
        ctx.restore();
      }
    }

    function frame(t: number) {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);
      const time = t * 0.001;
      for (const p of dots) {
        const pulse = 0.5 + 0.5 * Math.sin(time * 0.95 + p.phase); // opens + closes
        const s = R * (0.22 + 0.78 * pulse);
        const a = p.edge * (0.06 + 0.12 * pulse);
        ctx.fillStyle = `rgba(21,21,15,${a.toFixed(3)})`;
        shape(p.type, p.x, p.y, s);
      }
      raf = requestAnimationFrame(frame);
    }

    build();
    if (reduce) {
      // one static frame — no motion
      frame(0);
      cancelAnimationFrame(raf);
    } else {
      raf = requestAnimationFrame(frame);
    }

    const onResize = () => {
      build();
      if (reduce) {
        frame(0);
        cancelAnimationFrame(raf);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10"
    />
  );
}
