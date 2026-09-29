"use client";

import Link from "next/link";
import { NO_ACCOUNT_NOTE } from "@/components/onboarding/no-account";
import { PathPicker, SIDES } from "@/components/home/PathPicker";
import { OAuthButton } from "@/components/onboarding/OAuthButton";
import { RecommendNote } from "@/components/onboarding/RecommendNote";
import { Product } from "@/components/product/Product";
import type { Side } from "@/lib/apply-sides";
import { usePath } from "@/lib/path-theme";

/**
 * Moonshot's pre-order block, turned into the way in: the product standing
 * in an arch on the left; on the right a headline, a picker where Moonshot
 * picks a colour (here: which application), the promise for that path, and
 * the sign-in itself — so there is no separate "Apply" step: Google (and
 * GitHub for interns) goes straight through and lands in the questions, and
 * "without an account" skips the welcome page too. The picker's thumb slides,
 * the button's words follow, and the rocket repaints itself in the path's
 * colour.
 *
 * Each path's promise is the one already written in lib/apply-sections.ts.
 */

/** What each path promises; order and colours come from SIDES. */
const COPY: Record<Side, { cta: string; when: string; note: string }> = {
  intern: {
    cta: "Apply as an intern",
    when: "An answer within 14 days",
    note: "Rolling — a person reads every one",
  },
  startup: {
    cta: "Bring your startup in",
    when: "Reviewed by hand in a few days",
    note: "Then browse intern profiles and request people",
  },
  chapter: {
    cta: "Start a chapter",
    when: "Reviewed within a week",
    note: "Chapters are approved one at a time",
  },
};

export function ApplyBlock() {
  // The visitor's path is the picker's state: pick here and the whole site
  // recolours; come back later and it is still picked.
  const current = usePath();
  const active = Math.max(0, SIDES.findIndex((option) => option.side === current));
  const path = { ...SIDES[active], ...COPY[SIDES[active].side] };

  return (
    <section className="bg-ms-sky-soft px-5 py-14 sm:px-[6.5%] sm:py-28">
      <div className="mx-auto grid w-full max-w-[90rem] items-center gap-8 sm:gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div
          className="relative mx-auto aspect-[0.8] w-full max-w-[14rem] overflow-hidden rounded-t-[999px] rounded-b-[24px] sm:max-w-[34rem] sm:rounded-b-[36px]"
          style={{ background: "linear-gradient(180deg, #ffffff 0%, #f6f8f7 100%)" }}
        >
          <Product className="!absolute inset-0" scale={0.95} turn={1.2} paint={path.paint} burst />
        </div>

        <div>
          <p className="text-[13px] font-medium text-ms-body sm:text-[16px]">Applications open · rolling</p>
          <h2 className="ms-display mt-2 text-[2.3rem] text-ms-ink sm:mt-4 sm:text-[clamp(3rem,6vw,5.6rem)]">
            Start your
            <br />
            application
          </h2>
          <p className="mt-3 text-[15px] text-ms-body sm:mt-5 sm:text-[19px]">Free. About seven minutes. Save and finish later.</p>

          <p className="mt-6 text-[13px] font-medium text-ms-body sm:mt-10 sm:text-[15px]">Choose your path</p>
          <PathPicker active={active} className="mt-2 sm:mt-3" compact />

          <div className="mt-5 flex items-end justify-between gap-4 border-t border-ms-ink/10 pt-4 sm:mt-8 sm:gap-6 sm:pt-6">
            <div key={path.side} className="ms-rise">
              <p className="text-[14px] font-medium text-ms-ink sm:text-[17px]">{path.when}</p>
              <p className="mt-0.5 text-[12.5px] text-ms-body sm:mt-1 sm:text-[15px]">{path.note}</p>
            </div>
            <div className="text-right">
              <p className="ms-display text-[32px] sm:text-[44px]">$0</p>
              <p className="text-[12px] text-ms-body sm:text-[14px]">always</p>
            </div>
          </div>

          {/* Back from Google/GitHub, a signed-in visitor on /onboarding goes
              straight into the flow — the welcome page never shows. */}
          <div key={path.side} className="ms-rise mt-5 flex flex-col gap-2.5 sm:mt-7 sm:gap-3">
            <OAuthButton
              provider="google"
              next={`/onboarding?side=${path.side}`}
              label={`${path.cta} with Google`}
              compact
            />
            {path.side === "intern" ? (
              <div className="relative mb-6">
                <OAuthButton
                  provider="github"
                  tone="secondary"
                  next="/onboarding?side=intern"
                  label={`${path.cta} with GitHub`}
                  compact
                />
                <RecommendNote placement="below" />
              </div>
            ) : null}
          </div>
          <p className="mt-3 text-center text-[13.5px] text-ms-body sm:mt-4 sm:text-[15px]">
            <Link
              href={`/onboarding?side=${path.side}&start=1`}
              className="underline underline-offset-4 transition-opacity hover:opacity-60"
            >
              or apply without an account
            </Link>
          </p>
          <p className="mt-1 text-center text-[12px] text-ms-muted sm:mt-1.5 sm:text-[14px]">{NO_ACCOUNT_NOTE}</p>
        </div>
      </div>
    </section>
  );
}
