"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ThemeToggle } from "@/components/welcome/ThemeToggle";

/** Primary nav. "Actual website" is the old marketing landing at /classic. */
const PRIMARY = [
  { href: "/learn", label: "Videos" },
  { href: "/articles", label: "Articles" },
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
 * Centre nav from the reference. Closed it is a pill: burger + "Menu" + scroll
 * percentage. Open, the pill stays put but morphs — burger becomes an X,
 * "Menu" becomes "Close" — and a tall sheet grows downward behind it from the
 * pill's own top edge, so the pill reads as the lid of the sheet rather than a
 * separate control.
 */
export function MenuPill({ compact = false }: { compact?: boolean } = {}) {
  // Inside the product the pill is just the burger: the rail already carries
  // navigation and identity, so the label, theme toggle and scroll percentage
  // are noise there.
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.round((window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
              compact ? "right-[-0.5rem]" : "left-1/2 -translate-x-1/2"
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
                {PRIMARY.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="w-fit wel-fg text-[1.4rem] font-medium tracking-[-0.02em] transition-opacity duration-200 hover:opacity-55"
                  >
                    {l.label}
                  </Link>
                ))}
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
        className={`relative z-10 flex items-center wel-pill rounded-full shadow-[0_10px_30px_rgba(21,21,15,0.22)] ${
          compact ? "p-1.5" : "gap-1.5 p-2 pr-2.5"
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          className={`flex items-center rounded-full transition-opacity duration-200 hover:opacity-80 ${
            compact ? "gap-0 px-3.5 py-3.5" : "gap-3 px-4 py-2.5"
          }`}
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
          {/* Fixed width so the pill doesn't resize as the word swaps. */}
          <span
            className={`relative block h-[1.35em] w-[4rem] overflow-hidden text-left text-[1.05rem] font-medium ${
              compact ? "hidden" : ""
            }`}
          >
            <motion.span
              animate={{ y: open ? "-100%" : "0%" }}
              transition={{ duration: 0.36, ease: [0.16, 1, 0.3, 1] }}
              className="block"
            >
              <span className="block leading-[1.35em]">Menu</span>
              <span className="block leading-[1.35em]">Close</span>
            </motion.span>
          </span>
        </button>

        {!compact && (
          <>
            <ThemeToggle />

            <span className="rounded-full bg-white/15 px-3.5 py-2 font-mono text-[0.8rem] tabular-nums">
              {progress}%
            </span>
          </>
        )}
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
