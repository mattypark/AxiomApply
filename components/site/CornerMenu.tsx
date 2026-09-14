"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { DISCORD_INVITE_URL } from "@/lib/org";

/**
 * The corner menu.
 *
 * A pill parked in the bottom-right that opens upward into a right-aligned
 * card. It exists alongside the welcome header's MenuPill rather than
 * replacing it: this one serves the careers surface, where the reader is
 * standing still and reading rather than scrolling a pitch, and where the
 * three ways into Axiom need to stay one thumb-reach away the whole time.
 *
 * Right-aligned on purpose. The panel grows from the pill it replaced, so the
 * text edge nearest the pill never moves — the eye stays where it was.
 *
 * Mounted per-route (see app/careers/layout.tsx), not site-wide, so the
 * welcome screen's own chrome is left exactly as it is.
 */

/** Where you are. Quiet type — these are pages, not decisions. */
const PAGES = [
  { href: "/", label: "Home" },
  { href: "/about/internships", label: "About" },
  { href: "/careers", label: "Careers" },
] as const;

/** The three ways in. Set large — this is the actual decision. */
const WAYS_IN = [
  { href: "/onboarding?side=intern", label: "Apply" },
  { href: "/onboarding?side=startup", label: "Startups" },
  { href: "/onboarding?side=chapter", label: "Chapters" },
] as const;

const SOCIALS = [
  { href: "https://www.instagram.com/axiompathways/", label: "Instagram" },
  { href: "https://www.linkedin.com/company/axiom-pathways/", label: "LinkedIn" },
  { href: DISCORD_INVITE_URL, label: "Discord" },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function CornerMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();

  // Navigating closes it. Next keeps the layout mounted across route changes,
  // so without this the panel survives the click that dismissed it.
  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-end px-4 pb-4 sm:px-7 sm:pb-7">
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.div
            key="panel"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.34, ease: EASE }}
            style={{
              transformOrigin: "bottom right",
              // .glass alone is translucent enough that page content reads
              // through the panel on narrow screens, where it necessarily
              // covers cards. Keep its blur and shadow, raise the opacity.
              background:
                "linear-gradient(160deg, #fefaf4, #f7f4ec)",
            }}
            className="glass glass-deep pointer-events-auto flex w-[min(20rem,calc(100vw-2rem))] flex-col items-end gap-6 p-7"
          >
            <nav aria-label="Pages" className="flex flex-col items-end gap-1.5">
              {PAGES.map((page) => {
                const here = pathname === page.href;
                return (
                  <Link
                    key={page.href}
                    href={page.href}
                    aria-current={here ? "page" : undefined}
                    className={`text-[1.35rem] leading-tight font-medium tracking-tight transition-colors duration-200 ${
                      here ? "text-faint" : "text-ink hover:text-forest"
                    }`}
                  >
                    {page.label}
                  </Link>
                );
              })}
            </nav>

            <div
              className="w-full"
              style={{ borderTop: "1px solid var(--color-line)" }}
            />

            <nav aria-label="Apply" className="flex flex-col items-end gap-1.5">
              {WAYS_IN.map((way) => (
                <Link
                  key={way.href}
                  href={way.href}
                  className="group flex items-start gap-1 font-display text-[1.55rem] leading-tight font-normal tracking-tight text-ink transition-colors duration-200 hover:text-forest"
                >
                  {way.label}
                  <span
                    aria-hidden
                    className="mt-0.5 text-[0.8rem] text-faint transition-[transform,color] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-forest"
                  >
                    ↗
                  </span>
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap justify-end gap-x-4 gap-y-1">
              {SOCIALS.map((social) => (
                <a
                  key={social.href}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[0.82rem] text-muted transition-colors duration-200 hover:text-ink"
                >
                  {social.label}
                </a>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-[0.88rem] text-faint transition-colors duration-200 hover:text-ink"
            >
              Close
            </button>
          </motion.div>
        ) : (
          <motion.button
            key="pill"
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={false}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              background:
                "linear-gradient(160deg, #fefaf4, #f7f4ec)",
            }}
            className="glass glass-deep pointer-events-auto flex cursor-pointer items-center gap-2.5 rounded-full px-5 py-3 text-[0.9rem] font-medium text-ink transition-[transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
          >
            Everything Axiom
            <Dots />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Three dots as a triangle — the same geometry as the mark and the MenuPill. */
function Dots() {
  const dot = "absolute h-[3.5px] w-[3.5px] rounded-full bg-ink";
  return (
    <span className="relative block h-[12px] w-[12px]" aria-hidden="true">
      <span className={dot} style={{ top: 0, left: "50%", marginLeft: -1.75 }} />
      <span className={dot} style={{ bottom: 0, left: 0 }} />
      <span className={dot} style={{ bottom: 0, right: 0 }} />
    </span>
  );
}
