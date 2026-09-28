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
          className="fixed right-4 bottom-4 z-50 w-[min(calc(100vw-2rem),360px)] rounded-[16px] bg-white p-5 shadow-[0_0_0_1px_var(--color-border-muted),0_8px_24px_-8px_rgba(12,28,18,0.16),0_2px_6px_rgba(12,28,18,0.05)] sm:right-6 sm:bottom-6"
        >
          <button
            type="button"
            onClick={() => choose("essential")}
            aria-label="Dismiss"
            className="absolute top-4 right-4 grid h-7 w-7 place-items-center rounded-[8px] text-muted transition-colors duration-200 hover:bg-paper hover:text-loud"
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

          <h2 className="text-[15px] font-semibold text-loud">
            cookies
          </h2>
          <p className="mt-1.5 max-w-[40ch] text-[13px] leading-[19px] text-muted">
            we use cookies to keep you signed in and to understand how the site
            gets used. nothing is sold, and we don&apos;t run advertising
            trackers — details in our{" "}
            <Link href="/privacy" className="text-loud underline underline-offset-2">
              privacy policy
            </Link>
            .
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => choose("all")}
              className="btn-gloss btn-sm"
            >
              accept all
            </button>
            <button
              type="button"
              onClick={() => choose("essential")}
              className="btn-gloss-light btn-sm"
            >
              essential only
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
