import { AssetRing } from "@/components/welcome/AssetRing";
import { ResumeDrop } from "@/components/welcome/ResumeDrop";
import { WelcomeHeader } from "@/components/welcome/WelcomeHeader";
import { CookieBanner } from "@/components/welcome/CookieBanner";
import { HeadlineReveal } from "@/components/welcome/HeadlineReveal";
import { CategoryColumn } from "@/components/welcome/CategoryColumn";

/**
 * Full-viewport welcome screen, rebuilt from the reference recording
 * (frames in ~/Documents/Reference images/axiom-welcome-frames):
 *
 *   frame 0180 — tiles arriving one at a time, headline still filling in
 *   frame 0300 — ring assembled, headline complete, CTA live
 *   frame 0460 — same ring rotated clockwise; tiles still upright
 *
 * White ground, not the site's cream. The opaque plane below also hides the
 * global AmbientBackdrop and ShapeField (both -z-10), so this page reads clean
 * without touching the root layout every other route depends on.
 */
export function WelcomeHero({
  signedIn,
  ctaHref,
}: {
  signedIn: boolean;
  /** Where "Get started" should land, decided from the viewer's profile. */
  ctaHref: string;
}) {
  return (
    <>
      <div className="wel-bg fixed inset-0 z-0" aria-hidden="true" />

      <WelcomeHeader signedIn={signedIn} ctaHref={ctaHref} />

      <section className="relative z-10 flex h-dvh flex-col overflow-hidden">
        {/* stage — ring orbits around the drop target */}
        <div className="relative flex flex-1 items-center justify-center">
          <CategoryColumn />
          <div className="relative grid h-[min(64vw,500px)] w-[min(64vw,500px)] place-items-center">
            <AssetRing radius={222} />
            <div className="relative z-10">
              <ResumeDrop />
            </div>
          </div>
        </div>

        {/* bottom — slogan left, licence centred, scroll cue right */}
        <footer className="relative z-20 px-6 pb-5 sm:px-9 sm:pb-6">
          <HeadlineReveal
            className="mt-2 max-w-[18ch] text-[clamp(1.85rem,4.4vw,3.9rem)] leading-[1.08] font-bold tracking-[-0.03em]"
            lines={[
              { text: "Connecting young talent" },
              {
                small: true,
                muted: true,
                segments: [
                  { text: "to their ", muted: true },
                  { text: "passions", muted: true },
                ],
              },
            ]}
          />
          <p className="pointer-events-none absolute right-6 bottom-5 wel-fg-soft font-mono text-[0.7rem] tracking-[0.1em] opacity-60 sm:right-9 sm:bottom-6">
            ©2026
          </p>
        </footer>
      </section>

      <CookieBanner />
    </>
  );
}
