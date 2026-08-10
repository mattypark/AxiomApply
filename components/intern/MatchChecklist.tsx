"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { MatchSignal } from "@/lib/signals";

/**
 * The persistent progress card, pinned bottom-right across the workspace.
 *
 * It used to be a block halfway down the home page, which meant it only
 * existed on the one screen where someone was least likely to be working. As
 * a pinned card it follows them into Account and the feed — the places the
 * remaining steps actually get done.
 *
 * Collapsed state persists, and the whole card disappears once every step is
 * complete rather than lingering as a row of ticks.
 */

const COLLAPSE_KEY = "ax_checklist_collapsed";

export function MatchChecklist({ signals }: { signals: MatchSignal[] }) {
  const reduce = useReducedMotion();
  const [isOpen, setIsOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    try {
      setIsOpen(localStorage.getItem(COLLAPSE_KEY) !== "1");
    } catch {
      setIsOpen(true);
    }
    setIsReady(true);
  }, []);

  const toggle = () => {
    setIsOpen((open) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, open ? "1" : "0");
      } catch {
        /* private mode */
      }
      return !open;
    });
  };

  const done = signals.filter((signal) => signal.done).length;

  // Nothing left to nag about.
  if (done === signals.length) return null;
  // Hold the first paint until the stored state is known, so it cannot flash
  // open for someone who collapsed it.
  if (!isReady) return null;

  return (
    <div
      className="fixed right-4 z-40 w-[min(92vw,340px)] sm:right-6"
      // Clears the mobile dock, which is only present below `md`.
      style={{ bottom: "max(1.25rem, env(safe-area-inset-bottom))" }}
    >
      <div className="overflow-hidden rounded-[18px] bg-white shadow-[0_18px_50px_rgba(21,21,15,0.16)] ring-1 ring-ink/8">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
          className="flex w-full cursor-pointer items-center gap-3 px-4 py-3 text-left transition-colors duration-200 hover:bg-ink/[0.03]"
        >
          <span className="text-[0.92rem] font-semibold tracking-tight text-ink">
            Get matched
          </span>

          <span className="ml-auto flex items-center gap-2.5">
            <span className="font-mono text-[0.72rem] text-muted tabular-nums">
              {done}/{signals.length}
            </span>
            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-ink/10">
              <span
                className="block h-full rounded-full bg-forest transition-[width] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ width: `${(done / signals.length) * 100}%` }}
              />
            </span>
            <span
              aria-hidden
              className={`text-[0.7rem] text-faint transition-transform duration-300 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              ▾
            </span>
          </span>
        </button>

        <AnimatePresence initial={false}>
          {isOpen && (
            <motion.div
              initial={reduce ? false : { height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={reduce ? undefined : { height: 0, opacity: 0 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <ul className="flex flex-col gap-0.5 px-2 pb-2.5">
                {signals.map((signal) => (
                  <li key={signal.label}>
                    <Link
                      href={signal.href}
                      title={signal.hint}
                      className="group flex items-center gap-2.5 rounded-xl px-2 py-2 transition-colors duration-200 hover:bg-ink/[0.04]"
                    >
                      <span
                        aria-hidden
                        className={`grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full text-[0.58rem] transition-colors duration-300 ${
                          signal.done
                            ? "bg-forest text-white"
                            : "text-faint shadow-[inset_0_0_0_1px_rgba(21,21,15,0.2)]"
                        }`}
                      >
                        {signal.done ? "✓" : ""}
                      </span>
                      <span
                        className={`text-[0.86rem] transition-colors duration-200 ${
                          signal.done
                            ? "text-faint line-through"
                            : "text-ink group-hover:text-forest"
                        }`}
                      >
                        {signal.label}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
