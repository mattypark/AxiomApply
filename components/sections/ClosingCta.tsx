import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { DISCORD_INVITE_URL } from "@/lib/org";

/**
 * The ask, at the top of the closing band (SiteFooter draws the band).
 *
 * On desktop it opens with the landing pad: the story's rocket lifts off at
 * the end of its chapters and comes back down here, onto this pad, as the band
 * scrolls in (RocketScene finds it by `data-landing-pad`). The pad is a real
 * link — landing on it is the same as pressing enter — and it lights, along
 * with the button under it, once the rocket is down. No canvas below 1024px,
 * so no pad either.
 *
 * The Discord line rides along underneath at a whisper — it is the
 * low-commitment option for someone not ready to apply, and giving it equal
 * weight would let people feel done without applying.
 */
export function ClosingCta() {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <div className="hidden h-[330px] w-full items-end justify-center lg:flex">
        <Link
          href="/onboarding?side=intern"
          data-landing-pad
          aria-label="land here — start your application"
          className="group relative flex w-[260px] flex-col items-center"
        >
          <svg viewBox="0 0 260 64" className="landing-pad-ring h-16 w-[260px] overflow-visible" aria-hidden="true">
            <ellipse cx="130" cy="32" rx="126" ry="26" fill="rgb(5 15 9 / 0.28)" />
            <ellipse cx="130" cy="32" rx="126" ry="26" fill="none" stroke="rgb(238 246 238 / 0.35)" strokeWidth="1" />
            <ellipse
              cx="130"
              cy="32"
              rx="92"
              ry="18"
              fill="none"
              stroke="rgb(158 222 175 / 0.55)"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="transition-[stroke] duration-500 group-data-[landed=true]:stroke-[#9edeaf]"
            />
            <ellipse
              cx="130"
              cy="32"
              rx="54"
              ry="10"
              fill="rgb(158 222 175 / 0.12)"
              className="transition-[fill] duration-500 group-data-[landed=true]:fill-[rgb(158_222_175_/_0.35)]"
            />
          </svg>
          <span className="mt-3 text-[12px] text-white/60 transition-colors duration-500 group-hover:text-white group-data-[landed=true]:text-white">
            <span className="group-data-[landed=true]:hidden">landing pad</span>
            <span className="hidden group-data-[landed=true]:inline">landed — tap to start</span>
          </span>
        </Link>
      </div>

      <InView as="h2" className="mt-0 font-display text-title-h1 text-white lg:mt-10 [&_em]:italic">
        get in front of <em>them.</em>
      </InView>

      <InView delay={120} className="mt-7">
        <Link href="/onboarding?side=intern" className="btn-gloss landing-cta">
          enter <span aria-hidden="true">↗</span>
        </Link>
      </InView>

      <InView delay={200} className="mt-5">
        <p className="text-[13px] text-white/70">
          not ready yet?{" "}
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-white underline underline-offset-4 transition-opacity duration-200 hover:opacity-80"
          >
            the discord
          </a>{" "}
          gets new roles first.
        </p>
      </InView>
    </div>
  );
}
