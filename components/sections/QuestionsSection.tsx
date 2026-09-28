"use client";

import { useState } from "react";
import { SectionHead } from "@/components/sections/SectionHead";

/**
 * 03 — questions.
 *
 * The answers are unchanged from the previous FAQ; only the setting moved.
 * One open at a time, and the panel animates to its measured height with the
 * grid-rows trick rather than a pixel height, so an answer that reflows on
 * resize or a font swap can never end up clipped at a stale value.
 *
 * The feed count was quoted in one of these answers as a literal. It now says
 * "thousands": an FAQ is the last place a number should go stale, and the
 * exact figure already leads the band above.
 */

const FAQS = [
  {
    question: "who is axiom for?",
    answer:
      "high schoolers and early-college students. most of the network got in on what they had built, not where they go to school — there is no GPA cut-off and no résumé screen.",
  },
  {
    question: "what does it cost?",
    answer:
      "nothing. axiom is a nonprofit. the feed is open to everyone with no account, and applying to the network is free.",
  },
  {
    question: "what is the difference between the feed and the network?",
    answer:
      "the feed is thousands of live listings pulled from the best trackers and refreshed daily — apply to those yourself, we take no cut. the network is the startups we place people into by hand, and that runs through an application.",
  },
  {
    question: "how long does an application take to hear back?",
    answer:
      "fourteen days, either way. a person reads every one — not a filter, not a keyword scan. if we match you, the email names the startup and the role.",
  },
  {
    question: "what actually makes an application strong?",
    answer:
      "evidence you ship. a repo, a deployed site, an app in a store, a video with views, a club you actually ran. a deployed scrappy project beats a perfect local one, every time. links beat adjectives.",
  },
  {
    question: "i am under 18. does that matter?",
    answer:
      "it is the norm here, not the exception. a parent or guardian signs the agreement at placement time, and unpaid roles have to be structured as real learning rather than free labour. we sort that with the startup before you start.",
  },
  {
    question: "can i reapply if i am not matched?",
    answer:
      "yes, and it is not held against you — a real chunk of current interns are second-round. applications reopen each cycle and there is no cap on attempts.",
  },
] as const;

export function QuestionsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    // The menu links to /#faq, so this id is load-bearing, not decorative.
    <section id="faq" className="scroll-mt-24 py-24 sm:py-32">
      <SectionHead index="03" label="questions" icon="help" title="questions." />

      <div className="mx-auto w-full max-w-[49.5rem] px-6">
        <div className="mt-12">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border-t border-border-muted last:border-b"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-[18px] leading-[24px] font-medium tracking-[-0.2px] text-loud sm:text-[20px] sm:leading-[26px]">
                    {faq.question}
                  </span>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 14 14"
                    className="h-3.5 w-3.5 shrink-0 text-secondary transition-transform duration-300 ease-button"
                    style={{ transform: isOpen ? "rotate(45deg)" : undefined }}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  >
                    <path d="M7 1.5v11M1.5 7h11" />
                  </svg>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-400 ease-story"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[62ch] pb-6 text-body-default text-muted">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
