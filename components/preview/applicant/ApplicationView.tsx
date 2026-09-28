"use client";

import { useMemo, useState } from "react";
import { Card, Kicker } from "@/components/preview/Card";
import { PreviewControls, writeQuery } from "@/components/preview/PreviewControls";
import { STATUS_OPTIONS, toStage, type ViewStatus } from "@/components/preview/applicant/copy";
import { MY_ANSWERS, type Answer, type Lock } from "@/components/preview/mock-data";
import { usePath } from "@/lib/path-theme";

/**
 * "Your application": what they sent, and what they can still change.
 *
 * The rule (docs/DESIGN-AFTER-SUBMIT.md, "What can change") is one sentence
 * each applicant can hold in their head: links and files can always be
 * updated; the answers can be changed until someone has read them; who you
 * are and your email never change here. After a decision, it is a record.
 *
 * An edit never rewrites the original. It is sent as an update beside it,
 * so the reviewer sees what changed and when. In the prototype, Save only
 * changes this page.
 */

function editable(lock: Lock, stage: ReturnType<typeof toStage>["stage"]) {
  if (stage === "decided" || lock === "locked") return false;
  return lock === "open" || stage === "received";
}

const LOCK_NOTE: Record<string, string> = {
  received: "Links and files can always change. Answers can change until someone reads them.",
  read: "It has been read, so the answers are set. Links and files can still change.",
  decided: "There's a decision, so this is now the record of what you sent.",
};

export function ApplicationView({ initialStatus }: { initialStatus: ViewStatus }) {
  const side = usePath();
  const [status, setStatus] = useState(initialStatus);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, string>>({});
  const [flash, setFlash] = useState<string | null>(null);
  const [withdrawAsk, setWithdrawAsk] = useState(false);
  const { stage } = toStage(status);
  const answers = useMemo<Answer[]>(
    () => MY_ANSWERS[side].map((answer) => ({ ...answer, value: saved[answer.key] ?? answer.value })),
    [side, saved],
  );
  const canEdit = answers.some((answer) => editable(answer.lock, stage));
  const changed = Object.keys(draft).filter((key) => draft[key] !== answers.find((a) => a.key === key)?.value);

  const save = () => {
    setSaved((prev) => ({ ...prev, ...draft }));
    setFlash(
      changed.length
        ? `Updated ${changed.length} ${changed.length === 1 ? "answer" : "answers"} — on this page only. Nothing was sent.`
        : "Nothing changed.",
    );
    setDraft({});
    setEditing(false);
  };

  return (
    <main className="mx-auto w-full max-w-[56rem] px-4 pt-6 pb-28 sm:px-8 sm:pt-12">
      <h1 className="ms-display ms-rise text-[clamp(2.8rem,5.4vw,4.6rem)] text-ms-ink">Your application</h1>
      <p className="mt-4 max-w-[34rem] text-[17px] text-pretty text-ms-body">{LOCK_NOTE[stage]}</p>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {editing ? (
          <>
            <button type="button" onClick={save} className="ms-pill h-12 cursor-pointer text-[15px]">
              Save changes
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft({});
                setEditing(false);
              }}
              className="h-12 cursor-pointer rounded-full bg-white px-6 text-[15px] font-medium text-ms-ink"
            >
              Cancel
            </button>
          </>
        ) : canEdit ? (
          <button type="button" onClick={() => setEditing(true)} className="ms-pill h-12 cursor-pointer text-[15px]">
            Make a change
          </button>
        ) : null}
        {flash ? (
          <p role="status" className="text-[14px] text-ms-body">
            {flash}
          </p>
        ) : null}
      </div>

      <Card className="mt-8">
        <dl className="flex flex-col">
          {answers.map((answer) => {
            const open = editing && editable(answer.lock, stage);
            return (
              <div key={answer.key} className="grid gap-1 border-t border-ms-mist py-4 first:border-t-0 first:pt-0 sm:grid-cols-[14rem_1fr] sm:gap-6">
                <dt className="flex items-start justify-between gap-2 text-[14px] text-ms-muted sm:flex-col sm:justify-start">
                  <label htmlFor={`answer-${answer.key}`}>{answer.label}</label>
                  {!editable(answer.lock, stage) ? <span className="text-[12px] text-ms-muted/80">Locked</span> : null}
                </dt>
                <dd className="min-w-0 text-[16px] text-ms-ink">
                  {open ? (
                    <input
                      id={`answer-${answer.key}`}
                      value={draft[answer.key] ?? answer.value}
                      onChange={(event) => setDraft((prev) => ({ ...prev, [answer.key]: event.target.value }))}
                      className="h-11 w-full rounded-[14px] bg-ms-mist px-4 text-[16px] outline-none focus:ring-2 focus:ring-ms-green"
                    />
                  ) : (
                    <span className={answer.value ? "" : "text-ms-muted"}>{answer.value || "Not added"}</span>
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      </Card>

      {stage !== "decided" ? (
        <Card className="mt-4">
          <Kicker>Changed your mind?</Kicker>
          {withdrawAsk ? (
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <p className="text-[16px] text-ms-ink">Withdraw it? You can apply again next cycle.</p>
              <button type="button" onClick={() => setWithdrawAsk(false)} className="h-11 cursor-pointer rounded-full bg-ms-mist px-5 text-[15px] font-medium text-ms-ink">
                Keep it
              </button>
              <span className="text-[13px] text-ms-muted">(Prototype: withdrawing is disabled.)</span>
            </div>
          ) : (
            <button type="button" onClick={() => setWithdrawAsk(true)} className="mt-3 cursor-pointer text-[15px] text-ms-body underline underline-offset-4">
              Withdraw your application
            </button>
          )}
        </Card>
      ) : null}

      <PreviewControls
        groups={[
          {
            key: "status",
            label: "Status",
            value: status,
            options: STATUS_OPTIONS,
            onChange: (value) => {
              setStatus(value as ViewStatus);
              setEditing(false);
              setDraft({});
              writeQuery("status", value);
            },
          },
        ]}
      />
    </main>
  );
}
