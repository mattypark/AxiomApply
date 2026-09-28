"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SIDES } from "@/components/home/PathPicker";
import type { MockApplication, Outcome } from "@/components/preview/mock-data";
import { SIDE_LABEL, shortDate, statusLabel } from "@/components/preview/labels";
import { StatusPill } from "@/components/preview/hq/AppTable";

/**
 * One application, opened from the list: who, what they want, where it
 * stands, what changed after they sent it, and the decision buttons.
 *
 * Contact details start hidden behind "Show". Most applicants are minors;
 * the real version should log every reveal (who, when) so there is a record
 * of who looked at a phone number — see the spec's access section.
 *
 * Decisions here change only this page's memory. Nothing is written.
 */

const DOT = Object.fromEntries(SIDES.map((option) => [option.side, option.dot]));
const DECISIONS: Outcome[] = ["accepted", "waitlist", "rejected"];

export function DetailDrawer({
  app,
  onClose,
  onDecide,
}: {
  app: MockApplication;
  onClose: () => void;
  onDecide: (id: string, outcome: Outcome) => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const [reveal, setReveal] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  useEffect(() => {
    const returnTo = document.activeElement as HTMLElement | null;
    const frame = requestAnimationFrame(() => setShown(true));
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("keydown", onKey);
      returnTo?.focus?.();
    };
  }, [onClose]);

  // A new applicant in the same open drawer starts with contact hidden again.
  useEffect(() => {
    setReveal(false);
    setNote(null);
  }, [app.id]);

  const facts: [string, string | null][] = [
    [app.side === "startup" ? "Company" : "School", app.org],
    ["Chapter", app.chapter],
    ["Grade", app.grade],
    ["Interest", app.interest],
    ["Sheet row", `#${app.sheetRow} (backup copy)`],
  ];

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close"
        tabIndex={-1}
        onClick={onClose}
        className={`absolute inset-0 cursor-default bg-ms-ink/20 transition-opacity duration-300 motion-reduce:transition-none ${shown ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-lenis-prevent
        className={`ms absolute inset-y-0 right-0 flex w-full max-w-[32rem] flex-col overflow-y-auto bg-white shadow-[0_0_60px_-20px_rgb(23_25_28_/_0.5)] transition-transform duration-500 ease-ms motion-reduce:transition-none sm:rounded-l-[28px] ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white/90 px-6 pt-6 pb-4 backdrop-blur sm:px-8">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-[13px] text-ms-muted">
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOT[app.side] }} aria-hidden="true" />
              {SIDE_LABEL[app.side]} · submitted {shortDate(app.submittedAt)}
            </p>
            <h2 id={titleId} className="ms-display mt-2 truncate text-[34px] text-ms-ink">
              {app.name}
            </h2>
            <div className="mt-2"><StatusPill app={app} /></div>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-ms-mist text-[20px] text-ms-ink hover:bg-ms-sky"
            aria-label="Close details"
          >
            ×
          </button>
        </header>

        <div className="flex flex-col gap-7 px-6 pb-10 sm:px-8">
          <section>
            <p className="text-[13px] font-medium text-ms-muted">They&rsquo;re looking for</p>
            <p className="mt-1.5 text-[19px] leading-snug tracking-[-0.02em] text-ms-ink">{app.headline}</p>
          </section>

          <section className="rounded-[20px] bg-ms-mist p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[13px] font-medium text-ms-muted">Contact</p>
              <button type="button" onClick={() => setReveal((v) => !v)} className="cursor-pointer text-[13px] font-medium text-ms-ink underline underline-offset-4">
                {reveal ? "Hide" : "Show"}
              </button>
            </div>
            <p className="mt-2 text-[15px] text-ms-ink">{reveal ? app.email : "•••••@example.com"}</p>
            <p className="text-[15px] text-ms-ink tabular-nums">{reveal ? app.phone : "(•••) •••-••••"}</p>
          </section>

          <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-[14px]">
            {facts.filter(([, value]) => value).map(([label, value]) => (
              <div key={label} className="contents">
                <dt className="text-ms-muted">{label}</dt>
                <dd className="text-ms-ink">{value}</dd>
              </div>
            ))}
          </dl>

          <section>
            <p className="text-[13px] font-medium text-ms-muted">Timeline</p>
            <ol className="mt-3 flex flex-col gap-3 border-l-2 border-ms-mist pl-4 text-[14px]">
              <li><span className="text-ms-ink">Received</span> <span className="text-ms-muted">· {shortDate(app.submittedAt)}</span></li>
              {app.edits.map((edit) => (
                <li key={edit.at + edit.field}>
                  <span className="text-ms-ink">Edited {edit.field}</span>{" "}
                  <span className="text-ms-muted">· {shortDate(edit.at)} · {edit.from || "empty"} → {edit.to}</span>
                </li>
              ))}
              <li>
                <span className={app.readAt ? "text-ms-ink" : "text-ms-muted"}>
                  {app.readAt ? `Read by ${app.reviewer}` : "Not read yet"}
                </span>
                {app.readAt ? <span className="text-ms-muted"> · {shortDate(app.readAt)}</span> : null}
              </li>
              {app.outcome ? (
                <li>
                  <span className="text-ms-ink">{statusLabel(app.outcome, app.side)}</span>
                  {app.decidedAt ? <span className="text-ms-muted"> · {shortDate(app.decidedAt)}</span> : null}
                </li>
              ) : null}
            </ol>
          </section>

          <section>
            <p className="text-[13px] font-medium text-ms-muted">Decision</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {DECISIONS.map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  aria-pressed={app.outcome === outcome}
                  onClick={() => {
                    onDecide(app.id, outcome);
                    setNote(`Marked ${statusLabel(outcome, app.side).toLowerCase()} on this page only — nothing was saved or sent.`);
                  }}
                  className={`h-11 cursor-pointer rounded-full px-5 text-[15px] font-medium transition-colors ${
                    app.outcome === outcome ? "bg-ms-ink text-white" : "bg-ms-mist text-ms-ink hover:bg-ms-sky"
                  }`}
                >
                  {statusLabel(outcome, app.side)}
                </button>
              ))}
            </div>
            <p className="mt-3 text-[13px] text-ms-muted" role="status">
              {note ?? "A decision never emails anyone by itself — mail still goes out from the Decisions desk, in batches."}
            </p>
          </section>

          <section>
            <label htmlFor={`${titleId}-note`} className="text-[13px] font-medium text-ms-muted">
              Private note (Matthew + Frank only)
            </label>
            <textarea
              id={`${titleId}-note`}
              rows={3}
              placeholder="Not saved in the prototype."
              className="mt-2 w-full resize-y rounded-[16px] bg-ms-mist p-3 text-[15px] text-ms-ink outline-none placeholder:text-ms-muted focus:ring-2 focus:ring-ms-green"
            />
          </section>
        </div>
      </aside>
    </div>
  );
}
