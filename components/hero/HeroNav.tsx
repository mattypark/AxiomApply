"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * The floating nav.
 *
 * It carries a white pill while it is over the hero — the sky is near-black
 * green at the top and a bare wordmark vanished into it — and drops the pill
 * once it is over the page body, where the ground is already white and a
 * second white surface would just be a box around nothing. The mark stays
 * Axiom green and the links stay ink in both states, so only the surface
 * animates and nothing about the type changes as you scroll.
 *
 * Position comes from the hero's measured height rather than an observer on a
 * sentinel: the sentinel version flipped state while the hero was still on
 * screen and left white type on a white page, which read as the nav
 * disappearing.
 */
export function HeroNav({ signedIn, ctaHref }: { signedIn: boolean; ctaHref: string }) {
  const [onHero, setOnHero] = useState(true);
  const frame = useRef(0);

  useEffect(() => {
    const hero = document.getElementById("hero");

    const measure = () => {
      frame.current = 0;
      // The pill is needed for as long as any part of the sky sits behind the
      // bar itself, not until the hero has fully left.
      const bottom = hero ? hero.offsetHeight : window.innerHeight;
      setOnHero(window.scrollY < bottom - 96);
    };

    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  const links = [
    { href: "#how-it-works", label: "how it works" },
    { href: "#what-you-get", label: "what you get" },
    { href: "#faq", label: "questions" },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:pt-6">
      <nav
        className={`pointer-events-auto flex w-full max-w-[68rem] items-center justify-between gap-4 rounded-full px-5 py-3 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-story ${
          onHero
            ? "bg-white/92 shadow-[0_10px_34px_rgba(4,26,12,0.22)] backdrop-blur-xl"
            : "bg-transparent shadow-none"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2.5">
          <Image
            src="/axiom-mark-256.png"
            alt="Axiom Pathways"
            width={256}
            height={256}
            priority
            className="h-7 w-7 object-contain"
          />
          <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
            Axiom
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[0.95rem] text-ink/70 transition-colors duration-300 hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Enter is a plain link now. The fork overlay it used to open has
            been folded into the entry screen itself, where choosing a side is
            one line of text rather than a full screen asked before anything
            useful. */}
        <Link href={signedIn ? "/home" : ctaHref} className="btn-gloss shrink-0">
          {signedIn ? "home" : "enter"}
        </Link>
      </nav>
    </div>
  );
}
