"use client";

import type { Section } from "@/lib/apply-sections";
import type { Answers, Files, FlatQuestion } from "@/components/onboarding/flow/useApplication";

/**
 * Everything answered, grouped by part, before it is sent.
 *
 * The one screen that shows the whole application at once — the cost of
 * seeing twenty questions is paid after they are answered rather than
 * before. Any row jumps straight back to its question.
 */
export function Review({
  questions,
  answers,
  files,
  onEdit,
}: {
  questions: FlatQuestion[];
  answers: Answers;
  files: Files;
  onEdit: (index: number) => void;
}) {
  const groups: { section: Section; items: { flat: FlatQuestion; position: number }[] }[] = [];
  questions.forEach((flat, position) => {
    const last = groups[groups.length - 1];
    if (last && last.section === flat.section) last.items.push({ flat, position });
    else groups.push({ section: flat.section, items: [{ flat, position }] });
  });

  return (
    <div className="ax-q-in">
      <p className="text-[13px] text-app-accent">Review</p>
      <h2 className="mt-3 font-display text-[40px] leading-[44px] tracking-[-0.4px] text-app-text-1">
        Read it <em className="italic">back.</em>
      </h2>
      <p className="mt-3 text-[16px] leading-[24px] text-app-text-3">
        Tap anything to change it. Nothing is sent until you send it.
      </p>

      <div className="mt-10 flex flex-col gap-8">
        {groups.map((group) => (
          <section key={group.section.id + group.items[0].position}>
            <h3 className="text-[12px] text-app-text-3">{group.section.title}</h3>
            <dl className="mt-2">
              {group.items.map(({ flat, position }) => {
                const { question } = flat;
                const raw =
                  question.type === "file"
                    ? (files[question.id]?.name ?? "")
                    : (answers[question.id] ?? "");
                return (
                  <div key={question.id} className="border-t border-app-line last:border-b">
                    <button
                      type="button"
                      onClick={() => onEdit(position)}
                      className="flex w-full cursor-pointer items-baseline justify-between gap-6 py-3 text-left transition-colors duration-150 hover:bg-app-card/60"
                    >
                      <dt className="max-w-[45%] shrink-0 text-[13px] text-app-text-3">
                        {question.label}
                      </dt>
                      <dd
                        className={`min-w-0 text-right text-[14px] break-words ${
                          raw ? "text-app-text-1" : "text-app-text-3/60"
                        }`}
                      >
                        {raw || "—"}
                      </dd>
                    </button>
                  </div>
                );
              })}
            </dl>
          </section>
        ))}
      </div>
    </div>
  );
}
