import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { DotArc } from "@/components/hero/DotArc";

/**
 * The sign-in frame, klinn's /login in Axiom green.
 *
 * The whole page is the dark app canvas. On the left, an inset card carries
 * the sky, the dotted ring and one line of argument; on the right, the
 * account. It is the screen right after Enter, so the card is deliberately the
 * hero's sky again — walking through a door, not landing on a new site.
 *
 * On a phone the card collapses to a short banner: a full-height picture above
 * the button would mean scrolling past decoration to reach the only action.
 */
export function EnterShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col gap-2 bg-app-canvas p-[var(--hero-inset)] text-app-text-1 lg:flex-row lg:gap-0">
      <aside className="relative isolate flex shrink-0 flex-col justify-between overflow-hidden rounded-[var(--radius-hero)] px-7 py-8 lg:w-[50%] lg:px-16 lg:py-16">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(70% 60% at 70% 105%, rgb(127 207 149 / 0.55) 0%, transparent 70%), linear-gradient(180deg, #000a04 0%, #03301a 38%, #0f5a2b 72%, #2a9447 100%)",
          }}
        />
        <DotArc className="-z-10 opacity-60" />

        <Link
          href="/"
          className="flex w-fit items-center gap-2 transition-opacity duration-300 hover:opacity-75"
          aria-label="Axiom home"
        >
          <Image
            src="/axiom-mark-256.png"
            alt=""
            width={256}
            height={256}
            priority
            className="h-7 w-7 object-contain brightness-0 invert"
          />
          <span className="text-[22px] font-semibold tracking-[-0.03em] text-white">axiom</span>
        </Link>

        <div className="pt-8 pb-2 lg:py-0">
          <p className="text-[15px] text-white/80">your next chapter</p>
          <p className="mt-4 max-w-[12ch] font-display text-[36px] leading-[38px] tracking-[-0.4px] text-white sm:text-[72px] sm:leading-[70px] sm:tracking-[-1px]">
            good work deserves to be <em className="italic">seen.</em>
          </p>
          <p className="mt-6 hidden max-w-[36ch] text-[18px] leading-[26px] text-white/85 sm:block">
            one application. real startup work. a direct introduction to the
            person doing the hiring.
          </p>
        </div>

        <p className="hidden items-center gap-3 text-[13px] text-white/80 lg:flex">
          <span aria-hidden="true" className="text-[16px]">
            ↗
          </span>
          build something that opens doors.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-5 py-12 sm:px-10 lg:py-16">
        <div className="w-full max-w-[28rem]">{children}</div>
      </main>
    </div>
  );
}
