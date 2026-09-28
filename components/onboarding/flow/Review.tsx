"use client";

import type { Section } from "@/lib/apply-sections";
import { useFullLook } from "@/components/onboarding/flow/look";
import { RiseWords, rise } from "@/components/onboarding/flow/RiseWords";
import type { Answers, Files, FlatQuestion } from "@/components/onboarding/flow/useApplication";

/**
 * Everything answered, grouped by part, before it is sent.
 *
 * The one screen that shows the whole application at once — the cost of
 * seeing twenty questions is paid after they are answered rather than
 * before. Any row jumps straight back to its question.
 *
 * On the full-page flow each part is one of the welcome page's white cards,
 * rising in one after another under the heading.
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
  const full = useFullLook();
  const groups: { section: Section; items: { flat: FlatQuestion; position: number }[] }[] = [];
  questions.forEach((flat, position) => {
    const last = groups[groups.length - 1];
    if (last && last.section === flat.section) last.items.push({ flat, position });
    else groups.push({ section: flat.section, items: [{ flat, position }] });
  });

  const shown = (flat: FlatQuestion) =>
    flat.question.type === "file"
      ? (files[flat.question.id]?.name ?? "")
      : (answers[flat.question.id] ?? "");

  if (full) {
    return (
      <div>
        <p className="flow-rise flex items-center gap-2.5 text-[14px] font-medium text-ms-body" style={rise(0)}>
          <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-[var(--path-em)]" />
          Review
        </p>
        <h2 className="ms-display mt-4 text-[clamp(2.8rem,4.6vw,4.4rem)] text-ms-ink">
          <RiseWords text="Read it" start={60} />{" "}
          <span className="text-ms-green">
            <RiseWords text="back." start={150} />
          </span>
        </h2>
        <p className="flow-rise mt-4 text-[17px] leading-[1.45] text-ms-body" style={rise(260)}>
          Tap anything to change it. Nothing is sent until you send it.
        </p>

        <div className="mt-9 flex flex-col gap-4">
          {groups.map((group, order) => (
            <section
              key={group.section.id + group.items[0].position}
              className="flow-rise rounded-[28px] bg-white p-2 shadow-[0_24px_50px_-36px_rgb(23_25_28_/_0.45)]"
              style={rise(340 + order * 70)}
            >
              <h3 className="px-4 pt-3 pb-1.5 text-[13px] font-medium text-ms-muted">{group.section.title}</h3>
              <dl>
                {group.items.map(({ flat, position }) => {
                  const raw = shown(flat);
                  return (
                    <div key={flat.question.id} className="border-t border-ms-ink/[0.06] first:border-t-0">
                      <button
                        type="button"
                        onClick={() => onEdit(position)}
                        className="group flex w-full cursor-pointer items-baseline justify-between gap-6 rounded-[20px] px-4 py-3 text-left transition-colors duration-200 hover:bg-ms-mist"
                      >
                        <dt className="max-w-[45%] shrink-0 text-[13px] text-ms-muted">{flat.question.label}</dt>
                        <dd
                          className={`min-w-0 text-right text-[15px] break-words ${
                            raw ? "text-ms-ink" : "text-ms-muted"
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
