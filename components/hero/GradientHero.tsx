import Link from "next/link";
import { HeroNav } from "@/components/hero/HeroNav";
import { CookieBanner } from "@/components/welcome/CookieBanner";

/**
 * The hero, klinn's layout in Axiom green.
 *
 * The sky is an inset card with rounded top corners that runs well past the
 * fold and fades to nothing, so section 01 surfaces out of it rather than
 * starting under a hard edge. That is why it is absolutely positioned and
 * taller than the header: WelcomeSections carries no background of its own and
 * the tail of the sky shows through behind its first beat.
 *
 * `id="hero"` is what the nav measures to know when it has left the sky.
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
    <header id="hero" className="relative isolate">
      <div
        aria-hidden="true"
        className="sky-down absolute -z-10 h-[calc(100svh+14vh)] rounded-t-[var(--radius-hero)]"
        style={{
          top: "var(--hero-inset)",
          left: "var(--hero-inset)",
          right: "var(--hero-inset)",
        }}
      />

      <HeroNav signedIn={signedIn} ctaHref={ctaHref} />

      <div className="mx-auto flex min-h-svh w-full max-w-[52rem] flex-col items-center justify-center px-6 pt-28 pb-20 text-center">
        <span className="rounded-full bg-white/10 px-3 py-1 text-caption text-white/85 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)] backdrop-blur-md">
          {placements}+ startups · matched by hand
        </span>

        <h1 className="mt-12 font-display text-title-h1 text-white">
          finding your passion
          <br />
          starts at <em className="italic">axiom.</em>
        </h1>

        <p className="mt-4 max-w-[40ch] text-body-default text-white/85">
          one application. we put it in front of founders who are actually
          hiring, and make the introduction ourselves.
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link href={ctaHref} className="btn-gloss">
            {signedIn ? "go to app" : "enter"}
            <span aria-hidden="true">↗</span>
          </Link>
          <a href="#how-it-works" className="btn-gloss-quiet">
            how it works <span aria-hidden="true">↓</span>
          </a>
        </div>
      </div>

      <CookieBanner />
    </header>
  );
}
