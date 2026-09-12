"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * The fork behind Enter.
 *
 * The site serves two audiences who share a landing page and nothing else, so
 * the first click has to ask which one you are. /onboarding already asks it —
 * this overlay just asks it a beat earlier, over the hero, without a page
 * load between the decision and the button that prompted it.
 *
 * Two choices only. Chapters are a third thing people can start, but they are
 * not a third audience for this page, so they sit under the fold of the
 * overlay as a line of text rather than as an equal column.
 *
 * Visual language is deliberately the menu's: full-bleed paper, numbered
 * display type, one note per item. Two overlays that behave differently on the
 * same screen would read as two different sites.
 */

const EASE = [0.16, 1, 0.3, 1] as const;

const SIDES = [
  {
    href: "/onboarding?side=intern",
    label: "Interns",
    note: "Looking for real startup work",
  },
  {
    href: "/onboarding?side=startup",
    label: "Startups",
    note: "Hiring someone who ships",
  },
] as const;

export function EnterFork({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  // Portalled for the same reason the menu is: the header that opens this is
  // transformed on scroll, and a transform creates a containing block that
  // traps `fixed inset-0` beneath the hero.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Choose how you are joining"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-paper"
        >
          <div className="relative flex items-center justify-between px-6 pt-4 sm:px-12 sm:pt-7 lg:px-20">
            <span className="font-mono text-[0.72rem] font-semibold tracking-[0.1em] text-faint uppercase">
              Two ways in
            </span>
            <button
              type="button"
              onClick={onClose}
              className="group cursor-pointer text-[0.95rem] font-medium text-ink transition-opacity duration-200 hover:opacity-60"
            >
              Close
            </button>
          </div>

          <nav
            aria-label="Choose a side"
            className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-12 sm:px-12 lg:px-20"
          >
            {SIDES.map((side, index) => (
              <motion.div
                key={side.href}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.55,
                  ease: EASE,
                  delay: 0.08 + index * 0.07,
                }}
              >
                <Link
                  href={side.href}
                  onClick={onClose}
                  className="group flex w-fit items-baseline gap-4 sm:gap-7"
                >
                  <span className="font-display text-[1rem] text-faint transition-colors duration-300 group-hover:text-forest sm:text-[1.2rem]">
                    0{index + 1}
                  </span>
                  <span className="flex flex-col items-center">
                    <span className="font-display text-[clamp(2.8rem,8.5vw,7rem)] leading-[0.98] font-normal tracking-[-0.02em] text-ink transition-colors duration-300 group-hover:text-forest">
                      {side.label}
                    </span>
                    <span className="mt-1 text-[0.85rem] text-muted transition-colors duration-300 group-hover:text-forest-deep sm:text-[0.95rem]">
                      {side.note}
                    </span>
                  </span>
                </Link>
              </motion.div>
            ))}
          </nav>

          <motion.p
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="px-6 pb-10 text-center text-[0.9rem] text-muted sm:px-12 lg:px-20"
          >
            Starting a chapter at your school?{" "}
            <Link
              href="/onboarding?side=chapter"
              onClick={onClose}
              className="text-ink underline underline-offset-4 transition-colors duration-200 hover:text-forest"
            >
              That way
            </Link>
            .
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;
  return createPortal(panel, document.body);
}
