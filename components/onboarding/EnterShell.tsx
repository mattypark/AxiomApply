import type { ReactNode } from "react";
import Link from "next/link";
import { DotArc } from "@/components/hero/DotArc";

/**
 * The entry screen's frame.
 *
 * Two panels: the sky on the left carrying one line of argument, the work on
 * the right on white. The left panel is the same gradient and the same dot
 * field as the hero, because this is the screen immediately after Enter and it
 * should feel like walking through a door rather than landing on a different
 * website.
 *
 * On a phone the left panel collapses to a short banner — a full-height
 * decorative panel above the form would mean scrolling past a picture to reach
 * the first question.
 */
export function EnterShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper p-3 lg:flex-row lg:gap-3">
      <aside className="relative isolate flex shrink-0 flex-col justify-between overflow-hidden rounded-[24px] px-8 py-10 lg:w-[46%] lg:px-12 lg:py-14">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10"
          style={{
            background:
              "linear-gradient(168deg, var(--color-sky-deep) 0%, var(--color-sky-mid) 52%, var(--color-sky-bright) 100%)",
          }}
        />
        <DotArc className="-z-10 opacity-80" />

      {/* Wordmark only on the sky. The mark is a fine green line drawing and
          knocking it to white leaves a squiggle that disappears into the dot
          field — it earns its place on white surfaces, not on this one. */}
        <Link
          href="/"
          className="w-fit text-[1.1rem] font-semibold tracking-tight text-white transition-opacity duration-300 hover:opacity-75"
        >
          Axiom
        </Link>

        <div className="py-16 lg:py-0">
          <p className="font-mono text-[0.72rem] tracking-[0.12em] text-white/60 uppercase">
            Your next chapter
          </p>
          <p className="mt-6 max-w-[14ch] font-display text-[clamp(2.4rem,4.6vw,4.2rem)] leading-[1.02] tracking-[-0.02em] text-white">
            Good work deserves to be <em className="italic">seen</em>.
          </p>
          <p className="mt-7 max-w-[42ch] text-[1.02rem] leading-[1.55] text-white/75">
            One application. Real startup work. A direct introduction to the
            person doing the hiring.
          </p>
        </div>

        <p className="hidden items-center gap-2 text-[0.9rem] text-white/60 lg:flex">
          <span aria-hidden="true">↗</span> Build something that opens doors.
        </p>
      </aside>

      <main className="flex flex-1 items-center justify-center px-6 py-12 sm:px-10 lg:py-16">
        <div className="w-full max-w-[34rem]">{children}</div>
      </main>
    </div>
  );
}
