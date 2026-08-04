"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const KEY = "ax_theme";

/**
 * Light / dark switch. Writes `data-theme` on <html>; the palette overrides
 * live in globals.css so nothing here needs to know about colours.
 *
 * The initial value is applied by an inline script in the document head (see
 * app/layout.tsx) so there is no flash of the wrong theme on first paint —
 * this component only syncs its own icon and handles clicks.
 */
export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.theme === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.dataset.theme = next ? "dark" : "light";
    try {
      localStorage.setItem(KEY, next ? "dark" : "light");
    } catch {
      /* private mode — the choice just won't persist */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="grid h-8 w-8 place-items-center rounded-full transition-colors duration-200 hover:bg-white/12"
    >
      <motion.svg
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{ rotate: dark ? 0 : -18 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        aria-hidden="true"
      >
        {dark ? (
          // Sun — the action available while dark
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.4v2M12 19.6v2M2.4 12h2M19.6 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
          </>
        ) : (
          <path d="M20.5 14.6A8.5 8.5 0 1 1 9.4 3.5a6.8 6.8 0 0 0 11.1 11.1z" />
        )}
      </motion.svg>
    </button>
  );
}
