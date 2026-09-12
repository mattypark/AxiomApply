"use client";

import { useState } from "react";

/**
 * 06 — questions.
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
    question: "Who is Axiom for?",
    answer:
      "High schoolers and early-college students. Most of the network got in on what they had built, not where they go to school — there is no GPA cut-off and no résumé screen.",
  },
  {
    question: "What does it cost?",
    answer:
      "Nothing. Axiom is a nonprofit. The feed is open to everyone with no account, and applying to the network is free.",
  },
  {
    question: "What is the difference between the feed and the network?",
    answer:
      "The feed is thousands of live listings pulled from the best trackers and refreshed daily — apply to those yourself, we take no cut. The network is the startups we place people into by hand, and that runs through an application.",
  },
  {
    question: "How long does an application take to hear back?",
    answer:
      "Fourteen days, either way. A person reads every one — not a filter, not a keyword scan. If we match you, the email names the startup and the role.",
  },
  {
    question: "What actually makes an application strong?",
    answer:
      "Evidence you ship. A repo, a deployed site, an app in a store, a video with views, a club you actually ran. A deployed scrappy project beats a perfect local one, every time. Links beat adjectives.",
  },
  {
    question: "I am under 18. Does that matter?",
    answer:
      "It is the norm here, not the exception. A parent or guardian signs the agreement at placement time, and unpaid roles have to be structured as real learning rather than free labour. We sort that with the startup before you start.",
  },
  {
    question: "Can I reapply if I am not matched?",
    answer:
      "Yes, and it is not held against you — a real chunk of current interns are second-round. Applications reopen each cycle and there is no cap on attempts.",
  },
] as const;

export function QuestionsSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    // The menu links to /#faq, so this id is load-bearing, not decorative.
    <section id="faq" className="bg-paper py-28 sm:py-40">
      <div className="mx-auto w-full max-w-[68rem] px-6">
        <p className="flex items-center gap-2 font-mono text-[0.8125rem] tracking-[0.08em]">
          <span className="text-forest">06</span>
          <span className="text-faint">/ questions</span>
        </p>

        <h2 className="mt-6 font-display text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.04] tracking-[-0.015em] text-ink">
          Real answers.
        </h2>

        <div className="mt-14">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={faq.question}
                className="border-t border-ink/[0.08] last:border-b"
              >
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-6 py-7 text-left"
                >
                  <span className="font-display text-[clamp(1.25rem,2.6vw,1.75rem)] leading-[1.2] text-ink">
                    {faq.question}
                  </span>
                  <span
                    aria-hidden="true"
                    className="shrink-0 text-[1.5rem] leading-none text-muted transition-transform duration-300 ease-story"
                    style={{ transform: isOpen ? "rotate(180deg)" : undefined }}
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <div
                  className="grid transition-[grid-template-rows] duration-400 ease-story"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[62ch] pb-8 text-[1.0625rem] leading-[1.6] text-muted">
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
