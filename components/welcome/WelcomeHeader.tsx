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
      // flex, not grid: with the scroll percentage gone the middle grid
      // column had nothing in it, so the auth pills fell into it and sat
      // centred. Menu hard left, actions hard right, at every width.
      className="fixed inset-x-0 top-0 z-50 flex items-start justify-between gap-3 px-4 py-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform data-[hidden]:-translate-y-[130%] sm:gap-4 sm:px-9 sm:py-7"
    >
      {/* Left: the menu. The lockup used to sit here and now anchors the
          centre of the hero ring, which is the only place on the page big
          enough to show it at a readable size. */}
      {isApp ? (
        <Link
          href="/"
          aria-label="Axiom Pathways home"
          className={`w-fit items-center gap-2.5 transition-opacity duration-300 hover:opacity-70 ${
            showLogo ? "flex" : "hidden"
          }`}
        >
          <Image
            src="/axiom-lockup.png"
            alt="Axiom Pathways"
            width={800}
            height={400}
            priority
            className="h-11 w-auto object-contain"
          />
        </Link>
      ) : (
        <div className="w-fit">
          <MenuPill />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        {isApp && <MenuPill />}
        {isApp ? null : signedIn ? (
          // Signed in: one destination, not two. The avatar led to /account,
          // which reads as "settings" when what someone wants from the
          // marketing page is the way back into the product.
          <Link
            href="/home"
            className="wel-pill inline-flex items-center rounded-full px-6 py-3 text-[0.95rem] font-medium shadow-[0_10px_30px_rgba(21,21,15,0.22)] transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:opacity-85 sm:px-8 sm:py-4 sm:text-[1.05rem]"
          >
            Home
          </Link>
        ) : (
          <>
            {/* Sign in is for people who already have an account: straight to
                Google / email. Get started is for newcomers and goes to the
                side picker. Both pointed at /onboarding, which asked returning
                users a question they had already answered. */}
            <Link
              href="/auth?next=/home"
              className="wel-chip hidden items-center rounded-full px-8 py-4 text-[1.05rem] font-medium sm:inline-flex transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:opacity-80"
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
