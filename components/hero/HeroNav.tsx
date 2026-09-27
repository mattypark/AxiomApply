"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * The floating nav, klinn's behaviour.
 *
 * Over the sky it has no surface at all — white mark, white links — because
 * the sky is dark enough to carry white type and a pill on it would be a box
 * around nothing. Once the sky is gone it becomes a frosted light pill with a
 * soft shadow and dark type. Only one thing changes at the threshold, the
 * surface and the ink together, on klinn's theme easing.
 *
 * Position comes from the hero's measured height, not an observer: a sentinel
 * version flipped while sky was still behind the bar and left white type on a
 * white page. The hero is 100svh; the sky fades out just past it, so
 * the flip waits until the bar is over the pale end of the fade.
 */
export function HeroNav({ signedIn, ctaHref }: { signedIn: boolean; ctaHref: string }) {
  const [onSky, setOnSky] = useState(true);
  const frame = useRef(0);

  useEffect(() => {
    const hero = document.getElementById("hero");

    const measure = () => {
      frame.current = 0;
      const bottom = hero ? hero.offsetHeight : window.innerHeight;
      setOnSky(window.scrollY < bottom * 0.8);
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
    { href: "#faq", label: "faq" },
  ];

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-[calc(var(--hero-inset)+6px)]">
      <nav
        className={`pointer-events-auto flex h-[52px] w-full max-w-[52rem] items-center justify-between gap-4 rounded-[18px] pr-2 pl-4 transition-[background-color,box-shadow,backdrop-filter] duration-500 ease-theme ${
          onSky
            ? "bg-transparent shadow-none"
            : "bg-[#f3f8f4]/80 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset,0_10px_30px_rgba(4,36,16,0.1)] backdrop-blur-xl"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Axiom home">
          <Image
            src="/axiom-mark-256.png"
            alt=""
            width={256}
            height={256}
            priority
            className={`h-6 w-6 object-contain transition-[filter] duration-500 ease-theme ${
              onSky ? "brightness-0 invert" : ""
            }`}
          />
          <span
            className={`text-[17px] font-semibold tracking-[-0.02em] transition-colors duration-500 ease-theme ${
              onSky ? "text-white" : "text-loud"
            }`}
          >
            axiom
          </span>
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`text-[13px] font-medium transition-colors duration-500 ease-theme ${
                onSky ? "text-white/85 hover:text-white" : "text-loud/80 hover:text-loud"
              }`}
            >
              {link.label}
            </a>
          ))}
        </div>

        <Link href={signedIn ? "/home" : ctaHref} className="btn-gloss btn-sm shrink-0">
          {signedIn ? "go to app" : "enter"}
        </Link>
      </nav>
    </div>
  );
}
