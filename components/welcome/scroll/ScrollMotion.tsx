"use client";

import { useEffect } from "react";

/**
 * The motion layer for the scroll sections.
 *
 * Drives the flash-in headlines, the how section,
 * js/list-pin.js and js/ai-anima.js — same triggers, same easings, same
 * numbers. It runs once on mount against the DOM the sections render, which is
 * how the original works: the markup is static and the script wires it after
 * paint.
 *
 * GSAP loads dynamically so it stays out of the first-load bundle, and the
 * whole thing no-ops under prefers-reduced-motion.
 */

/* The word-flash ramp. Axiom green, not the reference's orange — the site has
   no orange in it outside the welcome screen's own accent. */
const HOT = "#2f6b3d";
const WARM = "#3f8f52";

/* how — floor opacity and where the fade finishes */
const FLOOR_OPACITY = 0.2;
const FADE_FINISH = 0.15;

/* The marquee lines ramp from faint ink at the bottom to Axiom forest at the
   top, so a line arriving reads as it darkening into the brand colour. */
const LINE_FROM = { r: 0x76, g: 0x74, b: 0x6a };
const LINE_TO = { r: 0x2f, g: 0x6b, b: 0x3d };

const ANIMA_TARGETS = [
  ".is-img-anima-1",
  ".is-img-anima-2",
  ".is-img-anima-3",
  ".is-img-anima-4",
  ".is-img-anima-5",
];

/** Wrap every word in a span so the flash can stagger across them. */
function splitToWords(element: Element) {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];
  while (walker.nextNode()) textNodes.push(walker.currentNode as Text);

  for (const node of textNodes) {
    const fragment = document.createDocumentFragment();

    for (const word of node.textContent?.split(/(\s+)/) ?? []) {
      if (!word.trim()) {
        fragment.appendChild(document.createTextNode(word));
        continue;
      }
      const span = document.createElement("span");
      span.className = "flash-word";
      span.textContent = word;
      fragment.appendChild(span);
    }

    node.parentNode?.replaceChild(fragment, node);
  }
}

export function ScrollMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cleanup = () => {};
    let cancelled = false;
    let rafId = 0;

    void (async () => {
      const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);

      const context = gsap.context(() => {
        /* ---- flash-text ------------------------------------------------ */
        const wire = (element: Element, finalColor: string) => {
          splitToWords(element);
          const words = element.querySelectorAll(".flash-word");
          if (words.length === 0) return;

          gsap.set(words, { opacity: 0, color: HOT });
          gsap.to(words, {
            scrollTrigger: {
              trigger: element,
              start: "top 85%",
              toggleActions: "play none none none",
            },
            // Slower than the reference on both axes: words arrive further
            // apart and each one holds its green longer before resolving.
            stagger: 0.1,
            ease: "power2.out",
            keyframes: [
              { opacity: 1, color: HOT, duration: 0.16 },
              { color: WARM, duration: 0.2 },
              { opacity: 1, color: finalColor, duration: 0.26 },
            ],
          });
        };

        document
          .querySelectorAll("[data-flash]")
          .forEach((element) => wire(element, "var(--fonts-100)"));
        /* ---- ai grids cross-fade --------------------------------------- */
        const animaTargets = ANIMA_TARGETS.filter((selector) =>
          document.querySelector(selector),
        );
        if (animaTargets.length > 0) {
          gsap.set(ANIMA_TARGETS, { opacity: 0, scale: 0.96, filter: "blur(6px)" });
          const timeline = gsap.timeline({
            repeat: -1,
            defaults: { duration: 0.8, ease: "power2.out" },
          });
          animaTargets.forEach((selector, index) => {
            timeline
              .to(
                selector,
                { opacity: 1, scale: 1, filter: "blur(0px)" },
                index * 1.6,
              )
              .to(
                selector,
                {
                  opacity: 0,
                  scale: 0.96,
                  filter: "blur(6px)",
                  duration: 0.6,
                },
                index * 1.6 + 1.1,
              );
          });
        }
      });

      /* ---- how: measure each marquee line every frame ------------------ */
      const howColumn = document.querySelector(".how__right");
      const titles = howColumn?.querySelectorAll<HTMLElement>(".how__right-title");

      if (howColumn && titles && titles.length > 0) {
        const frame = () => {
          const containerRect = howColumn.getBoundingClientRect();
          const containerHeight = containerRect.height;

          titles.forEach((title) => {
            const rect = title.getBoundingClientRect();
            const top = rect.top - containerRect.top;
            const bottom = top + rect.height;

            let opacity = FLOOR_OPACITY;
            if (bottom > 0 && top < containerHeight) {
              const norm = Math.min(Math.max(1 - bottom / containerHeight, 0), 1);
              const progress = Math.min(Math.max(norm / (1 - FADE_FINISH), 0), 1);
              opacity = FLOOR_OPACITY + progress * (1 - FLOOR_OPACITY);
            }

            title.style.opacity = String(opacity);

            // Same measured progress drives the colour: grey → forest.
            const mix = (opacity - FLOOR_OPACITY) / (1 - FLOOR_OPACITY);
            const channel = (from: number, to: number) =>
              Math.round(from + (to - from) * mix);
            title.style.color = `rgb(${channel(LINE_FROM.r, LINE_TO.r)}, ${channel(
              LINE_FROM.g,
              LINE_TO.g,
            )}, ${channel(LINE_FROM.b, LINE_TO.b)})`;
          });

          rafId = requestAnimationFrame(frame);
        };
        frame();
      }

      // ScrollTriggers measure the page at setup time. Anything that changes
      // layout afterwards — a resize, or an image finishing its load — leaves
      // every trigger's start/end pointing at stale positions, so the flash
      // headlines fire at the wrong scroll depth. Debounced refresh on both.
      let refreshTimer: ReturnType<typeof setTimeout>;
      const queueRefresh = () => {
        clearTimeout(refreshTimer);
        refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
      };

      window.addEventListener("resize", queueRefresh);

      const pendingImages = Array.from(
        document.querySelectorAll<HTMLImageElement>(".fx-scroll img"),
      ).filter((img) => !img.complete);
      pendingImages.forEach((img) => {
        img.addEventListener("load", queueRefresh, { once: true });
        img.addEventListener("error", queueRefresh, { once: true });
      });

      cleanup = () => {
        window.removeEventListener("resize", queueRefresh);
        pendingImages.forEach((img) => {
          img.removeEventListener("load", queueRefresh);
          img.removeEventListener("error", queueRefresh);
        });
        clearTimeout(refreshTimer);
        context.revert();
      };
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafId);
      cleanup();
    };
  }, []);

  return null;
}
