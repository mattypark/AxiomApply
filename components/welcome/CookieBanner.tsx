"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

const KEY = "ax_cookie_choice";

/**
 * Cookie notice.
 *
 * The site currently sets only what it needs to work — the Supabase auth
 * session — so there is nothing to gate. This records a choice, remembers it,
 * and stays honest about that rather than implying a tracking stack that
 * doesn't exist. Dismissing without choosing is treated as essential-only.
 */
export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      /* private mode — don't nag */
    }
  }, []);

  const choose = (value: "all" | "essential") => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* ignore */
    }
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 24 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
          role="dialog"
          aria-label="Cookie settings"
          className="fixed right-5 bottom-5 z-50 w-[min(92vw,420px)] rounded-[26px] bg-[#eeece7] p-6 shadow-[0_20px_60px_rgba(21,21,15,0.14)] sm:right-8 sm:bottom-8"
        >
          <button
            type="button"
            onClick={() => choose("essential")}
            aria-label="Dismiss"
            className="absolute top-5 right-5 grid h-8 w-8 place-items-center rounded-full bg-white/70 text-muted transition-colors duration-200 hover:text-ink"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
              <path
                d="M1 1l10 10M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <h2 className="text-[1.15rem] font-semibold tracking-tight text-ink">
            Cookie settings
          </h2>
          <p className="mt-2 max-w-[42ch] text-[0.86rem] leading-relaxed text-muted">
            We use cookies to keep you signed in and to understand how the site
            gets used. Nothing is sold, and we don&apos;t run advertising
            trackers — details in our{" "}
            <Link href="/privacy" className="text-ink underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => choose("all")}
              className="rounded-full bg-ink px-5 py-3 text-[0.9rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Accept all
            </button>
            <button
              type="button"
              onClick={() => choose("essential")}
              className="rounded-full bg-white/80 px-5 py-3 text-[0.9rem] font-medium text-ink transition-transform duration-300 hover:-translate-y-0.5"
            >
              Essential only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
