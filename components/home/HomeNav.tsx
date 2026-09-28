"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

/**
 * Moonshot's nav: across the full width over the hero, then — once you
 * scroll — it gathers into a centred floating pill with the same three
 * things in it. Only max-width, padding and the surface animate, so the
 * links never jump.
 */
export function HomeNav({ ctaHref, signedIn }: { ctaHref: string; signedIn: boolean }) {
  const [gathered, setGathered] = useState(false);

  useEffect(() => {
    const update = () => setGathered(window.scrollY > 80);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex justify-center px-4 pt-4 sm:px-6">
      <nav
        className={`pointer-events-auto flex w-full items-center justify-between gap-6 rounded-full transition-[max-width,padding,background-color,box-shadow] duration-500 ease-ms ${
          gathered
            ? "max-w-[34rem] bg-white/75 py-2 pr-2 pl-5 shadow-[0_0_0_1px_rgb(23_25_28_/_0.06),0_12px_32px_-12px_rgb(23_25_28_/_0.25)] backdrop-blur-xl"
            : "max-w-[100rem] bg-transparent py-2 pr-2 pl-2 shadow-none sm:pl-4"
        }`}
      >
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Axiom home">
          <Image
            src="/axiom-mark-256.png"
            alt=""
            width={256}
            height={256}
            priority
            className="h-8 w-8 object-contain"
          />
          <span className="text-[22px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
        </Link>

        <div className="hidden items-center gap-7 text-[16px] font-medium text-ms-ink sm:flex">
          <a href="#how" className="transition-opacity hover:opacity-60">
            How it works
          </a>
          <a href="#faq" className="transition-opacity hover:opacity-60">
            Questions
          </a>
        </div>

        <Link href={signedIn ? "/home" : ctaHref} className="ms-pill h-11 shrink-0 px-5 text-[15px]">
          {signedIn ? "Your home" : "Apply"}
          <span className="text-white/60">{signedIn ? "→" : "free"}</span>
        </Link>
      </nav>
    </div>
  );
}
