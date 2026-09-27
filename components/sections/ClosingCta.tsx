import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { DISCORD_INVITE_URL } from "@/lib/org";

/**
 * The ask, at the top of the closing band (SiteFooter draws the band).
 *
 * One line and one action. Everything before this has been argument. The
 * Discord line rides along underneath at a whisper — it is the low-commitment
 * option for someone not ready to apply, and giving it equal weight would let
 * people feel done without applying.
 */
export function ClosingCta() {
  return (
    <div className="flex flex-col items-center px-6 text-center">
      <InView as="h2" className="font-display text-title-h1 text-white [&_em]:italic">
        get in front of <em>them.</em>
      </InView>

      <InView delay={120} className="mt-7">
        <Link href="/onboarding?side=intern" className="btn-gloss">
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
