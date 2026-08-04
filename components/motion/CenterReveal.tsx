"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Strawberry-style entrance: everything materialises from the middle out.
 * `order` 0 = the centrepiece (appears first, biggest scale-up);
 * higher orders sit further from the centre and follow in sequence.
 */
export function CenterReveal({
  children,
  order = 0,
  className,
}: {
  children: ReactNode;
  order?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: "50% 50%" }}
      initial={
        reduce ? false : { opacity: 0, scale: 0.9, filter: "blur(10px)" }
      }
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      transition={{
        duration: 0.9,
        delay: 0.15 + order * 0.14,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
