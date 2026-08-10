"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

/**
 * The opening gesture: the lockup slides up into place and stays there.
 *
 * This is the hero's real logo, not an overlay copy. An earlier version put a
 * separate mark on a full-screen layer and scaled it away, which meant two
 * logos at two sizes crossfading past each other — visibly wrong. Animating
 * the actual element guarantees it lands exactly where it lives, because it
 * never moved anywhere else.
 *
 * Everything around it (the orbiting ring, the headline) offsets its own
 * entrance by INTRO_MS so the page assembles outward from this point.
 */

/** How long the lockup takes to arrive. Shared with the rest of the hero. */
export const INTRO_MS = 780;

export function HeroLockup() {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 46, scale: 0.88 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: INTRO_MS / 1000, ease: [0.16, 1, 0.3, 1] }}
      className="relative z-10"
    >
      <Image
        src="/axiom-lockup.png"
        alt="Axiom Pathways"
        width={800}
        height={400}
        priority
        className="w-[clamp(112px,26vw,280px)] object-contain"
      />
    </motion.div>
  );
}
