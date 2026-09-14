import Link from "next/link";
import { DotArc } from "@/components/hero/DotArc";
import { HeroNav } from "@/components/hero/HeroNav";
import { CookieBanner } from "@/components/welcome/CookieBanner";

/**
 * The hero.
 *
 * A green sky with a dot sphere behind it, one sentence set in the display
 * serif, and two actions. It replaces the orbiting logo ring — that hero was
 * beautiful and said nothing: a visitor learned who Axiom's partners were
 * before learning what Axiom does.
 *
 * The sky resolves into the page ground at the bottom rather than ending on a
 * hard edge, so the first section reads as the same document rather than as a
 * banner with a website under it.
 *
 * `hero-sentinel` is what the nav watches to know which ground it is on. It
 * sits at the foot of the sky, not at a pixel offset — hero height changes with
 * the viewport and a hard-coded threshold would invert the nav at the wrong
 * moment on a phone.
 */
export function GradientHero({
  signedIn,
  ctaHref,
  placements,
}: {
  signedIn: boolean;
  ctaHref: string;
  /** How many startups are in the network — the badge is a fact, not a slogan. */
  placements: number;
}) {
  return (
    <header id="hero" className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10"
        style={{
          background:
            "linear-gradient(180deg, var(--color-sky-deep) 0%, var(--color-sky-mid) 46%, var(--color-sky-bright) 78%, var(--color-paper) 100%)",
        }}
      />
      <DotArc className="-z-10" />

      <HeroNav signedIn={signedIn} ctaHref={ctaHref} />

      <div className="mx-auto flex min-h-dvh w-full max-w-[68rem] flex-col items-center justify-center px-6 py-32 text-center">
        <span className="rounded-full bg-white/12 px-4 py-1.5 text-[0.85rem] text-white/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.16)] backdrop-blur-md">
          {placements}+ startups · matched by hand
        </span>

        <h1 className="mt-10 max-w-[19ch] font-display text-[clamp(2.6rem,6.4vw,5.2rem)] leading-[1.04] tracking-[-0.02em] text-white">
          Finding your passion
          <br />
          starts at <em className="italic">Axiom</em>.
        </h1>

        <p className="mt-8 max-w-[54ch] text-[clamp(1rem,1.5vw,1.18rem)] leading-[1.55] text-white/80">
          One application. We put it in front of founders who are actually
          hiring and make the introduction ourselves — free, because we are a
          nonprofit.
        </p>

        <div className="mt-11 flex flex-wrap items-center justify-center gap-3">
          <Link href={ctaHref} className="btn-gloss px-7 py-3.5 text-[1.02rem]">
            enter <span aria-hidden="true">↗</span>
          </Link>
          <a href="#how-it-works" className="btn-gloss-quiet px-7 py-3.5 text-[1.02rem]">
            how it works <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <CookieBanner />
    </header>
  );
}
