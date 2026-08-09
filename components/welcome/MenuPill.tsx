"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";

/** Primary nav. "Actual website" is the old marketing landing at /classic. */
const PRIMARY = [
  // Sign in lives here too: the header hides its pill below `sm`, so on a
  // phone this sheet is the only way to reach it.
  { href: "/onboarding", label: "Sign in" },
  { href: "/learn", label: "Videos" },
  // The published writing lives on the org site, not in this app.
  { href: "https://www.axiompathways.org/articles", label: "Articles" },
  { href: "/classic", label: "Actual website" },
  { href: "/apply", label: "Our features" },
] as const;

const OTHER = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

const SOCIAL = [
  { href: "https://www.instagram.com/axiompathways/", label: "Instagram" },
] as const;

/**
 * Primary nav, top left. Closed it is a circle carrying just the burger —
 * the word "Menu" said nothing the icon did not. Open, the circle stays put
 * and the burger becomes an X, while a tall sheet grows downward behind it from the
 * pill's own top edge, so the pill reads as the lid of the sheet rather than a
 * separate control.
 *
 * Scroll progress and the theme toggle used to live inside this pill; they are
 * now their own controls in the header (ScrollPercent, ThemeToggle).
 */
export function MenuPill({ compact = false }: { compact?: boolean } = {}) {
  // Inside the product the pill is just the burger: the rail already carries
  // navigation and identity, so the label, theme toggle and scroll percentage
  // are noise there.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="relative flex flex-col items-center">
      {/* sheet — grows down from behind the pill */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scaleY: 0.55 }}
            animate={{ opacity: 1, scaleY: 1 }}
            exit={{ opacity: 0, scaleY: 0.55 }}
            transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
            style={{ transformOrigin: "top center" }}
            className={`absolute top-[-0.7rem] w-[min(88vw,330px)] wel-sheet rounded-[30px] pt-[4.6rem] pb-8 shadow-[0_24px_70px_rgba(21,21,15,0.14)] ${
              compact ? "right-[-0.5rem]" : "left-0"
            }`}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex flex-col px-7"
            >
              <SectionLabel>Menu</SectionLabel>
              <div className="mt-2 flex flex-col gap-0.5">
                {PRIMARY.map((l) => {
                  const isExternal = l.href.startsWith("http");
                  const className =
                    "w-fit wel-fg text-[1.4rem] font-medium tracking-[-0.02em] transition-opacity duration-200 hover:opacity-55";

                  // Off-site entries open in a new tab so the app keeps its
                  // place — next/link would navigate away from the session.
                  return isExternal ? (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setOpen(false)}
                      className={className}
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.href}
                      href={l.href}
                      onClick={() => setOpen(false)}
                      className={className}
                    >
                      {l.label}
                    </Link>
                  );
                })}
              </div>

              <hr className="my-7 border-0 border-t border-current/10" />

              <SectionLabel>Other</SectionLabel>
              <div className="mt-2 flex flex-col gap-1">
                {OTHER.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="w-fit wel-fg text-[0.92rem] transition-opacity duration-200 hover:opacity-55"
                  >
                    {l.label}
                  </Link>
                ))}
              </div>

              <SectionLabel className="mt-9">Social media</SectionLabel>
              <div className="mt-2 flex flex-col gap-1">
                {SOCIAL.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-fit wel-fg text-[0.92rem] transition-opacity duration-200 hover:opacity-55"
                  >
                    {l.label}
                  </a>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* pill — stays above the sheet */}
      <div
        className="relative z-10 flex items-center wel-pill rounded-full p-1.5 shadow-[0_10px_30px_rgba(21,21,15,0.22)]"
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className="flex items-center rounded-full px-3.5 py-3.5 transition-opacity duration-200 hover:opacity-80"
        >
          <span className="relative block h-5 w-5" aria-hidden="true">
            <motion.span
              animate={{ rotate: open ? 45 : 0, y: open ? 0 : -4.5 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 left-0 block h-[1.5px] w-full rounded bg-current"
            />
            <motion.span
              animate={{ rotate: open ? -45 : 0, y: open ? 0 : 4.5 }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="absolute top-1/2 left-0 block h-[1.5px] w-full rounded bg-current"
            />
          </span>
        </button>

      </div>
    </div>
  );
}

function SectionLabel({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`wel-fg-soft text-[0.82rem] ${className}`}>{children}</span>
  );
}
