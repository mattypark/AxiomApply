"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { einLine } from "@/lib/org";

/**
 * Primary nav.
 *
 * Closed it is the word "Menu" and three dots set as a triangle — no pill, no
 * chrome. Open, it takes the whole screen: the mark top-left, three numbered
 * destinations staggered down the page, then everything else small underneath.
 *
 * The three big items are the three sides — intern, startup, chapter — because
 * that is the only decision this site actually asks anyone to make.
 */

/** The decision. Numbered, set large, staggered left / right / left. */
const SIDES = [
  {
    href: "/onboarding?side=intern",
    label: "Intern",
    note: "Looking for an internship",
    indent: "0%",
  },
  {
    href: "/onboarding?side=startup",
    label: "Startup",
    note: "Hiring interns",
    indent: "34%",
  },
  {
    href: "/onboarding?side=chapter",
    label: "Chapter",
    note: "Start one at your school",
    indent: "0%",
  },
] as const;

/**
 * Everything that is not the decision. Sign in lives here rather than in the
 * header: it serves people who already have an account, which is the smaller
 * audience, and the header only has room for one real action.
 */
const SECONDARY = [
  { href: "/", label: "Homepage" },
  { href: "/about/internships", label: "About us" },
  { href: "/about/learn", label: "Who we are" },
  { href: "/#faq", label: "FAQs" },
  // The published writing lives on the org site, not in this app.
  { href: "https://www.axiompathways.org/articles", label: "Articles" },
  { href: "/auth", label: "Sign in" },
] as const;

const LEGAL = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/cookies", label: "Cookies" },
] as const;

const CONTACT = [
  { href: "mailto:matthew@axiompathways.org", label: "matthew@axiompathways.org" },
  { href: "https://www.instagram.com/axiompathways/", label: "Instagram" },
  {
    href: "https://www.linkedin.com/company/axiom-pathways/",
    label: "LinkedIn",
  },
] as const;

const EASE = [0.16, 1, 0.3, 1] as const;

export function MenuPill() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  // The panel is portalled to <body>. The header that renders this control is
  // transformed (it hides on scroll), and a transform creates a containing
  // block — so a `fixed inset-0` child is trapped in the header's stacking
  // context and paints UNDER the hero. Portalling is what actually escapes it.
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);

    // The panel covers the viewport, so the page behind it must not scroll —
    // otherwise closing the menu drops you somewhere you never navigated to.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  const close = () => setOpen(false);

  const panel = (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: -18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -12 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="fixed inset-0 z-[100] flex flex-col overflow-y-auto bg-paper"
        >
          {/* The way home, top-left — the one thing that should always be
              reachable from an overlay that covers the page. */}
          <div className="flex items-center justify-between px-6 pt-7 sm:px-12 lg:px-20">
            <Link
              href="/"
              onClick={close}
              aria-label="Axiom Pathways home"
              className="flex items-center gap-2.5 transition-opacity duration-300 hover:opacity-70"
            >
              <img
                src="/axiom-mark.png"
                alt=""
                width={30}
                height={30}
                className="h-[30px] w-[30px] object-contain"
              />
              <span className="text-[1rem] font-semibold tracking-tight text-ink">
                Axiom Pathways
              </span>
            </Link>

            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="group flex cursor-pointer items-center gap-2.5"
            >
              <span className="text-[0.95rem] font-medium text-ink transition-opacity duration-200 group-hover:opacity-60">
                Close
              </span>
              <motion.span
                initial={{ rotate: 120 }}
                animate={{ rotate: 120 }}
                exit={{ rotate: 0 }}
                transition={{ duration: 0.55, ease: EASE }}
                className="grid h-6 w-6 place-items-center"
              >
                <Dots />
              </motion.span>
            </button>
          </div>

          {/* the decision — numbered, staggered */}
          <nav
            aria-label="Main"
            className="flex flex-1 flex-col justify-center gap-2 px-6 py-12 sm:px-12 lg:px-20"
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
                  onClick={close}
                  className="group flex w-fit items-baseline gap-4 sm:gap-7 md:ml-[var(--indent)]"
                  style={{ ["--indent" as string]: side.indent }}
                >
                  <span className="font-display text-[1rem] text-faint transition-colors duration-300 group-hover:text-forest sm:text-[1.2rem]">
                    0{index + 1}
                  </span>
                  <span className="flex flex-col">
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

          {/* everything else, kept small */}
          <motion.div
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.3 }}
            className="px-6 pb-8 sm:px-12 lg:px-20"
            style={{ borderTop: "1px solid var(--lines)", paddingTop: "1.75rem" }}
          >
            <Link
              href="/onboarding"
              onClick={close}
              className="mb-6 inline-flex w-fit items-center rounded-full bg-ink px-7 py-3.5 text-[0.95rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Get started →
            </Link>

            <div className="flex flex-wrap gap-x-7 gap-y-2">
              {SECONDARY.map((link) =>
                link.href.startsWith("http") ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={close}
                    className="text-[0.95rem] text-muted transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={close}
                    className="text-[0.95rem] text-muted transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>

            {/* contact bottom-left, legal bottom-right */}
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6">
              <address className="flex flex-col gap-1 not-italic">
                {CONTACT.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={
                      link.href.startsWith("http")
                        ? "noopener noreferrer"
                        : undefined
                    }
                    className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase transition-colors duration-200 hover:text-ink"
                  >
                    {link.label}
                  </a>
                ))}
              </address>

              <div className="flex flex-col gap-1 sm:text-right">
                <div className="flex flex-wrap gap-x-4 sm:justify-end">
                  {LEGAL.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={close}
                      className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase transition-colors duration-200 hover:text-ink"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <p className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase">
                  © 2026 Axiom Pathways
                  {einLine() ? ` · ${einLine()}` : ""}
                </p>
                <p className="font-mono text-[0.72rem] tracking-[0.1em] text-faint uppercase">
                  All rights reserved
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div className="relative flex flex-col items-center">
      {mounted && createPortal(panel, document.body)}

      {/* Bare dots, no pill. The label sits to their left so the control still
          says what it is at a glance, and the dots rotate a third of a turn on
          open — unwinding on close. */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={open}
        aria-label="Open menu"
        className="group relative z-10 flex cursor-pointer items-center gap-2.5"
      >
        <span className="text-[0.95rem] font-medium text-ink transition-opacity duration-200 group-hover:opacity-60">
          Menu
        </span>
        <motion.span
          animate={{ rotate: open ? 120 : 0 }}
          transition={{ duration: 0.55, ease: EASE }}
          className="grid h-6 w-6 place-items-center"
        >
          <Dots />
        </motion.span>
      </button>
    </div>
  );
}

/** Three dots arranged as a triangle — the same geometry as the mark. */
function Dots() {
  const dot = "absolute h-[4px] w-[4px] rounded-full bg-ink";
  return (
    <span className="relative block h-[14px] w-[14px]" aria-hidden="true">
      <span className={dot} style={{ top: 0, left: "50%", marginLeft: -2 }} />
      <span className={dot} style={{ bottom: 0, left: 0 }} />
      <span className={dot} style={{ bottom: 0, right: 0 }} />
    </span>
  );
}
