"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { MenuPill } from "@/components/welcome/MenuPill";
import { GetStartedButton } from "@/components/welcome/GetStartedButton";

/**
 * The welcome-screen header: logo left, menu pill centre, auth + CTA right.
 *
 * It lives at page level rather than inside the hero section — a `fixed` child
 * of the hero was being clipped once the hero scrolled away, which is why the
 * bar vanished part-way down the page.
 *
 * Behaviour: it follows you the whole way down, hiding while you scroll down
 * and coming back the moment you scroll up. Near the very top it is always
 * shown, so the first paint never starts hidden.
 */

/** Pixels of travel before a direction change counts — kills jitter. */
const THRESHOLD = 8;

/** Below this we never hide; the hero should always have its chrome. */
const ALWAYS_SHOW_ABOVE = 120;

export function WelcomeHeader({
  signedIn,
  ctaHref,
  showLogo = true,
  variant = "site",
}: {
  signedIn: boolean;
  ctaHref: string;
  /** Off on surfaces that already show the mark (the workspace rail). */
  showLogo?: boolean;
  /**
   * "site" — the welcome screen: logo, centred pill, auth actions.
   * "app"  — inside the product: just the menu, hard right. The rail already
   *          carries identity and navigation, so the pill drops its label,
   *          theme toggle, scroll percentage and the account icon.
   */
  variant?: "site" | "app";
}) {
  const [isHidden, setIsHidden] = useState(false);
  const lastY = useRef(0);
  const isApp = variant === "app";

  useEffect(() => {
    lastY.current = window.scrollY;
    let frame = 0;

    const onScroll = () => {
      if (frame) return;

      frame = requestAnimationFrame(() => {
        frame = 0;
        const y = window.scrollY;
        const delta = y - lastY.current;

        if (Math.abs(delta) < THRESHOLD) return;
        lastY.current = y;

        setIsHidden(y > ALWAYS_SHOW_ABOVE && delta > 0);
      });
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <header
      data-hidden={isHidden || undefined}
      className={`fixed inset-x-0 top-0 z-50 grid items-start gap-4 px-6 py-6 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform data-[hidden]:-translate-y-[130%] sm:px-9 sm:py-7 ${
        isApp ? "grid-cols-[1fr_auto]" : "grid-cols-[1fr_auto_1fr]"
      }`}
    >
      <Link
        href="/"
        aria-label="Axiom Pathways home"
        className={`w-fit items-center gap-2.5 transition-opacity duration-300 hover:opacity-70 ${
          showLogo ? "flex" : "hidden"
        }`}
      >
        <Image
          src="/axiom-mark.png"
          alt="Axiom Pathways"
          width={46}
          height={46}
          priority
        />
        <span className="wel-fg hidden font-mono text-[0.78rem] leading-tight tracking-[0.18em] uppercase sm:block">
          Axiom
          <br />
          Pathways
        </span>
      </Link>

      {!isApp && <MenuPill />}

      <div className="flex items-center justify-end gap-3">
        {isApp && <MenuPill compact />}
        {isApp ? null : signedIn ? (
          // Signed in → just the profile icon; the pills are for newcomers.
          <Link
            href="/account"
            aria-label="Your account"
            title="Your account"
            className="wel-pill grid h-14 w-14 place-items-center rounded-full shadow-[0_10px_30px_rgba(21,21,15,0.22)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:opacity-85"
          >
            <svg
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 21a8 8 0 0 1 16 0z" />
            </svg>
          </Link>
        ) : (
          <>
            <Link
              href="/onboarding"
              className="wel-chip inline-flex items-center rounded-full px-8 py-4 text-[1.05rem] font-medium transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:opacity-80"
            >
              Sign in
            </Link>
            <GetStartedButton href={ctaHref} />
          </>
        )}
      </div>
    </header>
  );
}
