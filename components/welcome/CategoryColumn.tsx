"use client";

import { motion } from "framer-motion";

/**
 * The floating category column on the right edge of the reference — a
 * vertical list of pill chips that drifts upward on a loop, with the entries
 * at the top and bottom faded so they dissolve rather than pop.
 *
 * Reference labels are their content types (Stories, Street style, PDPs,
 * UGC, Lifestyle shots). Ours are the tracks an intern can actually pick,
 * so the shape is copied and the substance is Axiom's.
 */
const CATEGORIES = [
  "AI",
  "Computer Science",
  "Marketing",
  "Finance",
  "Design",
  "Startups",
] as const;

export function CategoryColumn() {
  // Doubled so the loop can translate a full list height and reset seamlessly.
  const loop = [...CATEGORIES, ...CATEGORIES];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute top-1/2 right-2 hidden h-[420px] w-[210px] -translate-y-1/2 overflow-hidden lg:block"
      style={{
        maskImage:
          "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
      }}
    >
      <motion.div
        className="flex flex-col items-end gap-3"
        animate={{ y: ["0%", "-50%"] }}
        transition={{ duration: 26, ease: "linear", repeat: Infinity }}
      >
        {loop.map((c, i) => (
          <span
            key={`${c}-${i}`}
            // Tag boxes: bordered rounded-rects on the page ground,
            // not floating pills.
            className="wel-fg rounded-[8px] border border-[rgba(21,21,15,0.18)] bg-white px-4 py-1.5 text-[1rem] whitespace-nowrap"
          >
            {c}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
