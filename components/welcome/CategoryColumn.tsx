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

/** Tags land after the ring has started filling, one every fifth of a second. */
const ENTRANCE_START = 0.9;
const ENTRANCE_STEP = 0.2;

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
        transition={{
          duration: 26,
          ease: "linear",
          repeat: Infinity,
          // The drift waits for the arrival below to finish, so the tags are
          // not sliding in and scrolling up at the same time.
          delay: ENTRANCE_START + CATEGORIES.length * ENTRANCE_STEP,
        }}
      >
        {loop.map((c, i) => (
          <motion.span
            key={`${c}-${i}`}
            // Each tag slides in from the right edge, one at a time, top to
            // bottom. Only the first pass is staggered — the duplicates that
            // make the loop seamless are already in place behind the mask.
            initial={{ opacity: 0, x: 48 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay:
                i < CATEGORIES.length
                  ? ENTRANCE_START + i * ENTRANCE_STEP
                  : ENTRANCE_START,
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
            // Tag boxes: bordered rounded-rects on the page ground,
            // not floating pills.
            // Ground and border come from the theme tokens, never a literal.
            // `bg-white` under `wel-fg` meant light text on a white box in
            // dark mode — the chips vanished.
            className="wel-tile wel-fg rounded-[8px] border border-current/15 px-4 py-1.5 text-[1rem] whitespace-nowrap"
          >
            {c}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
