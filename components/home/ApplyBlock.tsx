"use client";

import { useState } from "react";
import Link from "next/link";
import type { Paint } from "@/components/product/model";
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

const PATHS: {
  side: Side;
  label: string;
  dot: string;
  paint: Paint;
  cta: string;
  when: string;
  note: string;
}[] = [
  {
    side: "intern",
    label: "Intern",
    dot: "#366645",
    paint: "green",
    cta: "Apply as an intern",
    when: "An answer within 14 days",
    note: "Rolling — a person reads every one",
  },
  {
    side: "startup",
    label: "Startup",
    dot: "#4f6fc9",
    paint: "blue",
    cta: "Bring your startup in",
    when: "Reviewed by hand in a few days",
    note: "Then browse intern profiles and request people",
  },
  {
    side: "chapter",
    label: "Chapter",
    dot: "#26292d",
    paint: "black",
    cta: "Start a chapter",
    when: "Reviewed within a week",
    note: "Chapters are approved one at a time",
  },
];

export function ApplyBlock() {
  const [active, setActive] = useState(0);
  const path = PATHS[active];

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
          <div
            role="radiogroup"
            aria-label="Choose your path"
            className="relative mt-3 grid w-full max-w-[32rem] grid-cols-3 rounded-full bg-white/55 p-1.5"
          >
            <span
              aria-hidden="true"
              className="absolute top-1.5 bottom-1.5 left-1.5 rounded-full bg-white shadow-[0_6px_18px_-8px_rgb(23_25_28_/_0.35)] transition-transform duration-500 ease-ms"
              style={{ width: "calc((100% - 12px) / 3)", transform: `translateX(${active * 100}%)` }}
            />
            {PATHS.map((option, index) => (
              <button
                key={option.side}
                type="button"
                role="radio"
                aria-checked={index === active}
                onClick={() => setActive(index)}
                className="relative flex h-12 cursor-pointer items-center justify-center gap-2 rounded-full text-[16px] font-medium text-ms-ink"
              >
                <span className="h-3 w-3 rounded-full" style={{ background: option.dot }} />
                {option.label}
                {index === active ? <span aria-hidden="true">✓</span> : null}
              </button>
            ))}
          </div>

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
