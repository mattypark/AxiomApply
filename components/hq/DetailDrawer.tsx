"use client";

import { useEffect, useId, useRef, useState } from "react";
import { SIDES } from "@/components/home/PathPicker";
import { decisionsFor } from "@/lib/data/hq/normalise";
import type { HqContact, HqDecision, HqDetail, Ok } from "@/lib/data/hq/types";
import { SIDE_LABEL, shortDay, statusLabel } from "@/components/hq/labels";
import { StatusPill } from "@/components/hq/AppTable";

/**
 * One application, opened from the list: who, what they want, where it
 * stands, and the two things a reviewer does here: mark it read, decide.
 *
 * Contact details start hidden behind "Show", and each reveal is written to
 * the audit log on the server before anything comes back. Most applicants
 * are minors; there should be a record of who looked at a phone number.
 *
 * A decision never emails anyone. Mail still goes out from the Decisions
 * desk, in batches, for deliverability.
 */

const DOT = Object.fromEntries(SIDES.map((option) => [option.side, option.dot]));

export function DetailDrawer({
  id,
  detail,
  problem,
  onClose,
  onReveal,
  onDecide,
  onMarkRead,
}: {
  id: string;
  /** Null while loading. */
  detail: HqDetail | null;
  problem: string | null;
  onClose: () => void;
  onReveal: (id: string) => Promise<HqContact | null>;
  onDecide: (id: string, decision: HqDecision) => Promise<Ok>;
  onMarkRead: (id: string) => Promise<Ok>;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const [contact, setContact] = useState<HqContact | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
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
    setContact(null);
    setNote(null);
  }, [id]);

  async function run(key: string, action: () => Promise<Ok>, done: string) {
    setBusy(key);
    setNote(null);
    const result = await action().catch(() => ({ ok: false, error: "That didn't save. Try again." }));
    setBusy(null);
    setNote(result.ok ? done : (result.error ?? "That didn't save. Try again."));
  }

  async function toggleContact() {
    if (contact) {
      setContact(null);
      return;
    }
    setBusy("contact");
    const result = await onReveal(id).catch(() => null);
    setBusy(null);
    if (result) setContact(result);
    else setNote("Couldn't show contact details right now.");
  }

  const app = detail;
  const sheetDisagrees =
    app?.decidedVia === "hq" && app.side === "intern" && (app.sheetDecision ?? "").trim().toLowerCase() !== app.status;

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
        aria-busy={!app}
        data-lenis-prevent
        className={`ms absolute inset-y-0 right-0 flex w-full max-w-[32rem] flex-col overflow-y-auto bg-white shadow-[0_0_60px_-20px_rgb(23_25_28_/_0.5)] transition-transform duration-500 ease-ms motion-reduce:transition-none sm:rounded-l-[28px] ${
          shown ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-4 bg-white/90 px-6 pt-6 pb-4 backdrop-blur sm:px-8">
          <div className="min-w-0">
            {app ? (
              <>
                <p className="flex items-center gap-2 text-[13px] text-ms-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: DOT[app.side] }} aria-hidden="true" />
                  {SIDE_LABEL[app.side]} · submitted {shortDay(app.submittedAt)}
                </p>
                <h2 id={titleId} className="ms-display mt-2 truncate text-[34px] text-ms-ink">
                  {app.name}
                </h2>
                <div className="mt-2">
                  <StatusPill status={app.status} side={app.side} />
                </div>
              </>
            ) : (
              <h2 id={titleId} className="mt-2 text-[20px] text-ms-muted">
                {problem ?? "Loading…"}
              </h2>
            )}
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

        {app ? (
          <div className="flex flex-col gap-7 px-6 pb-10 sm:px-8">
            {app.headline ? (
              <section>
                <p className="text-[13px] font-medium text-ms-muted">They&rsquo;re looking for</p>
                <p className="mt-1.5 text-[19px] leading-snug tracking-[-0.02em] text-ms-ink">{app.headline}</p>
              </section>
            ) : null}

            <section className="rounded-[20px] bg-ms-mist p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[13px] font-medium text-ms-muted">Contact</p>
                <button
                  type="button"
                  onClick={toggleContact}
                  disabled={busy === "contact"}
                  className="cursor-pointer text-[13px] font-medium text-ms-ink underline underline-offset-4 disabled:opacity-60"
                >
                  {contact ? "Hide" : busy === "contact" ? "Showing…" : "Show"}
                </button>
              </div>
              <p className="mt-2 break-all text-[15px] text-ms-ink">{contact ? contact.email : "•••••@•••••"}</p>
              {app.side !== "startup" ? (
                <p className="text-[15px] text-ms-ink tabular-nums">{contact ? (contact.phone ?? "No phone given") : "(•••) •••-••••"}</p>
              ) : null}
              <p className="mt-2 text-[12px] text-ms-muted">Showing is logged: who, and when.</p>
            </section>

            <dl className="grid grid-cols-[7rem_1fr] gap-x-4 gap-y-2 text-[14px]">
              {(
                [
                  [app.side === "startup" ? "Company" : "School", app.org],
                  ["Chapter", app.chapter],
                  ["Grade", app.grade],
                  ["Interest", app.interest],
                  ["Sheet row", app.sheetRow ? `#${app.sheetRow} (backup copy)` : null],
                ] as const
              )
                .filter(([, value]) => value)
                .map(([label, value]) => (
                  <div key={label} className="contents">
                    <dt className="text-ms-muted">{label}</dt>
                    <dd className="min-w-0 break-words text-ms-ink">{value}</dd>
                  </div>
                ))}
            </dl>

            {!app.answers.length ? (
              <section className="rounded-[20px] bg-[#f1ead6] p-4 text-[14px] leading-relaxed text-ms-ink">
                <p className="font-medium">Their answers aren&rsquo;t copied here yet.</p>
                <p className="mt-1 text-ms-body">
                  {app.sheetRow ? `They're in the Sheet, row #${app.sheetRow}. ` : "They're in the Sheet. "}
                  Press &ldquo;Push decisions to site&rdquo; in the Sheet (with the updated script) and they&rsquo;ll fill in here.
                </p>
              </section>
            ) : null}

            {app.answers.length ? (
              <section>
                <p className="text-[13px] font-medium text-ms-muted">Their answers</p>
                <dl className="mt-3 flex flex-col gap-4">
                  {app.answers.map((answer) => (
                    <div key={answer.label}>
                      <dt className="text-[13px] text-ms-muted">{answer.label}</dt>
                      <dd className="mt-0.5 text-[15px] leading-relaxed whitespace-pre-line break-words text-ms-ink">
                        {/^https?:\/\//.test(answer.value) ? (
                          <a href={answer.value} target="_blank" rel="noreferrer noopener" className="underline underline-offset-4">
                            {answer.value}
                          </a>
                        ) : (
                          answer.value
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              </section>
            ) : null}

            <section>
              <p className="text-[13px] font-medium text-ms-muted">Timeline</p>
              <ol className="mt-3 flex flex-col gap-3 border-l-2 border-ms-mist pl-4 text-[14px]">
                <li>
                  <span className="text-ms-ink">Received</span> <span className="text-ms-muted">· {shortDay(app.submittedAt)}</span>
                </li>
                <li>
                  <span className={app.status === "new" ? "text-ms-muted" : "text-ms-ink"}>
                    {app.status === "new" ? "Not read yet" : app.reviewer ? `Read by ${app.reviewer}` : "Read"}
                  </span>
                  {app.readAt ? <span className="text-ms-muted"> · {shortDay(app.readAt)}</span> : null}
                </li>
                {app.status !== "new" && app.status !== "read" ? (
                  <li>
                    <span className="text-ms-ink">{statusLabel(app.status, app.side)}</span>
                    <span className="text-ms-muted">
                      {app.decidedAt ? ` · ${shortDay(app.decidedAt)}` : ""}
                      {app.decidedVia ? ` · in ${app.decidedVia === "hq" ? "HQ" : "the Sheet"}` : ""}
                      {app.decidedBy ? ` by ${app.decidedBy}` : ""}
                    </span>
                  </li>
                ) : null}
              </ol>
            </section>

            <section>
              <p className="text-[13px] font-medium text-ms-muted">Decision</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {app.status === "new" ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => run("read", () => onMarkRead(id), "Marked read.")}
                    className="h-11 cursor-pointer rounded-full bg-white px-5 text-[15px] font-medium text-ms-ink shadow-[inset_0_0_0_1px_rgb(23_25_28_/_0.15)] hover:bg-ms-mist disabled:opacity-60"
                  >
                    {busy === "read" ? "Saving…" : "Mark read"}
                  </button>
                ) : null}
                {decisionsFor(app.side).map((decision) => (
                  <button
                    key={decision}
                    type="button"
                    aria-pressed={app.status === decision}
                    disabled={busy !== null}
                    onClick={() =>
                      run(decision, () => onDecide(id, decision), `Saved as ${statusLabel(decision, app.side).toLowerCase()}. Nobody was emailed.`)
                    }
                    className={`h-11 cursor-pointer rounded-full px-5 text-[15px] font-medium transition-colors disabled:opacity-60 ${
                      app.status === decision ? "bg-ms-ink text-white" : "bg-ms-mist text-ms-ink hover:bg-ms-sky"
                    }`}
                  >
                    {busy === decision ? "Saving…" : statusLabel(decision, app.side)}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-[13px] text-ms-muted" role="status">
                {note ?? "A decision never emails anyone by itself — mail still goes out from the Decisions desk, in batches."}
              </p>
              {sheetDisagrees ? (
                <p className="mt-2 rounded-[14px] bg-[#f1ead6] px-3 py-2 text-[13px] text-ms-ink">
                  Decided in HQ.{" "}
                  {app.sheetDecision?.trim()
                    ? `The Sheet's column Y still says “${app.sheetDecision.trim()}”`
                    : "The Sheet's column Y is still blank"}{" "}
                  — update it there so the backup matches. A later change in column Y wins.
                </p>
              ) : null}
            </section>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
