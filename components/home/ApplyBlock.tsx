"use client";

import { useState } from "react";
import Link from "next/link";
import { PathPicker, SIDES } from "@/components/home/PathPicker";
import { Product } from "@/components/product/Product";
import type { Side } from "@/lib/apply-sides";

/**
 * Moonshot's pre-order block, turned into the way in: the product standing
 * in an arch on the left; on the right a headline, a picker where Moonshot
 * picks a colour (here: which application), the promise for that path, and
 * one black button. The picker's thumb slides, the button's words follow,
 * and the rocket repaints itself in the path's colour.
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
  const [active, setActive] = useState(0);
  const path = { ...SIDES[active], ...COPY[SIDES[active].side] };

  return (
    <section className="bg-ms-sky-soft px-6 py-24 sm:px-[6.5%] sm:py-28">
      <div className="mx-auto grid w-full max-w-[90rem] items-center gap-14 lg:grid-cols-[1fr_1.05fr] lg:gap-20">
        <div
          className="relative mx-auto aspect-[0.8] w-full max-w-[34rem] overflow-hidden rounded-t-[999px] rounded-b-[36px]"
          style={{ background: "linear-gradient(180deg, #ffffff 0%, #f6f8f7 100%)" }}
        >
          <Product className="!absolute inset-0" scale={0.95} turn={1.2} paint={path.paint} />
        </div>

        <div>
          <p className="text-[16px] font-medium text-ms-body">Applications open · rolling</p>
          <h2 className="ms-display mt-4 text-[clamp(3rem,6vw,5.6rem)] text-ms-ink">
            Start your
            <br />
            application
          </h2>
          <p className="mt-5 text-[19px] text-ms-body">Free. About seven minutes. Save and finish later.</p>

          <p className="mt-10 text-[15px] font-medium text-ms-body">Choose your path</p>
          <PathPicker active={active} onChange={setActive} className="mt-3" />

          <div className="mt-8 flex items-end justify-between gap-6 border-t border-ms-ink/10 pt-6">
            <div key={path.side} className="ms-rise">
              <p className="text-[17px] font-medium text-ms-ink">{path.when}</p>
              <p className="mt-1 text-[15px] text-ms-body">{path.note}</p>
            </div>
            <div className="text-right">
              <p className="ms-display text-[44px]">$0</p>
              <p className="text-[14px] text-ms-body">always</p>
            </div>
          </div>

          <Link href={`/onboarding?side=${path.side}`} className="ms-pill mt-7 h-16 w-full text-[18px]">
            <span key={path.cta} className="ms-rise">
              {path.cta}
            </span>
          </Link>
          <p className="mt-4 text-center text-[15px] text-ms-body">
            <span aria-hidden="true">↺ </span>Nothing is sent until you press send.
          </p>
        </div>
      </div>
    </section>
  );
}
