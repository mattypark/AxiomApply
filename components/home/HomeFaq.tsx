"use client";

import { useState } from "react";

/**
 * Moonshot's "A few good questions." — four, not seven. The answers are the
 * site's existing ones, trimmed; the long list still lives in the app.
 */
const QUESTIONS = [
  {
    q: "Who is Axiom for?",
    a: "High schoolers and early-college students. Most of the network got in on what they had built, not where they go to school. There is no GPA cut-off and no résumé screen.",
  },
  {
    q: "What does it cost?",
    a: "Nothing. Axiom is a nonprofit. The internship feed is open to everyone, and applying to the network is free.",
  },
  {
    q: "How long until I hear back?",
    a: "Fourteen days, either way. A person reads every application. If we match you, the email names the startup and the role.",
  },
  {
    q: "I'm under 18. Does that matter?",
    a: "It's the norm here, not the exception. A parent or guardian signs the agreement when you're placed, and unpaid roles have to be real learning, not free labour.",
  },
] as const;

export function HomeFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="scroll-mt-24 bg-white px-5 py-14 sm:px-[6.5%] sm:py-32">
      <div className="mx-auto grid w-full max-w-[90rem] gap-5 sm:gap-12 lg:grid-cols-[1fr_1.4fr]">
        <h2 className="ms-display text-[2rem] text-ms-ink sm:text-[clamp(2.6rem,4.8vw,4.2rem)]">
          A few good
          <br />
          questions.
        </h2>
        <div>
          {QUESTIONS.map((item, index) => {
            const isOpen = open === index;
            return (
              <div key={item.q} className="border-b border-ms-ink/10">
                <button
                  type="button"
                  aria-expanded={isOpen}
                  onClick={() => setOpen(isOpen ? null : index)}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 py-4 text-left sm:gap-6 sm:py-6"
                >
                  <span className="text-[1rem] font-medium tracking-[-0.02em] text-ms-ink sm:text-[clamp(1.2rem,1.7vw,1.5rem)]">
                    {item.q}
                  </span>
                  <span
                    aria-hidden="true"
                    className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ms-mist text-[16px] text-ms-ink transition-transform duration-500 ease-ms sm:h-9 sm:w-9 sm:text-[20px]"
                    style={{ transform: isOpen ? "rotate(45deg)" : undefined }}
                  >
                    +
                  </span>
                </button>
                <div
                  className="grid transition-[grid-template-rows] duration-500 ease-ms"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="max-w-[56ch] pb-5 text-[14px] leading-[1.55] text-ms-body sm:pb-7 sm:text-[17px]">{item.a}</p>
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
