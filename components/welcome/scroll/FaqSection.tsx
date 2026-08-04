"use client";

import { useState } from "react";

/**
 * Section 10 — FAQs.
 *
 * Ported from fourmula-clone/index.html (`.faq`) with its accordion behaviour
 * rewritten as React state rather than the original's class toggling: one item
 * open at a time, the panel animating to its measured height.
 *
 * The height animation uses a grid-rows trick instead of measuring
 * scrollHeight, so an answer that reflows (resize, font swap) can never end up
 * clipped at a stale pixel height.
 */

type Faq = {
  question: string;
  answer: string;
};

const FAQS: Faq[] = [
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
      "The feed is 12,597 live listings pulled from the best trackers and refreshed daily — apply to those yourself, we take no cut. The network is the 10+ startups we place people into by hand, and that runs through an application.",
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
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="faq">
      <div className="faq__left">
        {/* Oversized on purpose — the label owns the whole left cell. */}
        <p className="faq__txt u-h2 u-fonts-100">FAQs</p>
      </div>

      <div className="faq__right">
        <div className="faq__title">
          <h2 className="faq__title-in u-h2" data-flash>
            Not AI-gen answers.
            <br />
            Real ones here.
          </h2>
        </div>

        <div className="faq__main">
          <div className="faq__wrap">
            <div className="faq__list">
              {FAQS.map((faq, index) => {
                const isOpen = openIndex === index;

                return (
                  <div
                    key={faq.question}
                    className={`faq__item ${isOpen ? "active" : ""}`}
                  >
                    <button
                      type="button"
                      className="faq__item-title"
                      aria-expanded={isOpen}
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                    >
                      <span className="faq__label u-body-3">{faq.question}</span>
                      <span className="faq__icon" aria-hidden="true">
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>

                    <div className="faq__content" data-open={isOpen || undefined}>
                      <div className="faq__content-inner">
                        <p className="faq__content-txt u-body-2 u-fonts-64">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
