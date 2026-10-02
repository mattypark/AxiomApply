"use client";

import { useEffect, useId, useRef, useState } from "react";
import { YC_DEAL_USD, claimsAboutMatthew, contactFor, raiseOf, safeUrl } from "@/lib/data/outreach/logic";
import type { OutreachClient, OutreachPatch, OutreachRow, OutreachSaved, OutreachStatus } from "@/lib/data/outreach/types";
import { Icon, IconLink, Initials, LINK_LABEL, Logo, SourcePill, StatusSelect, linksOf } from "./bits";

/**
 * One company in full: what they do, every way to reach them, why they might
 * want students, the money, the draft, and notes. The list only carries light
 * rows, so the drawer loads the full one when it opens.
 */

interface DrawerProps {
  row: OutreachRow;
  client: OutreachClient;
  onClose: () => void;
  onSave: (slugs: string[], patch: OutreachPatch) => Promise<OutreachSaved>;
  onCopy: (text: string) => void;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6 border-t border-ms-mist pt-5">
      <h3 className="mb-3 text-[12px] font-semibold tracking-[0.06em] text-ms-muted uppercase">{title}</h3>
      {children}
    </section>
  );
}

function money(amount: number): string {
  return amount >= 1e6 ? `$${Number((amount / 1e6).toFixed(1))}M` : `$${Math.round(amount / 1e3)}K`;
}

export function OutreachDrawer({ row, client, onClose, onSave, onCopy }: DrawerProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [shown, setShown] = useState(false);
  const [full, setFull] = useState<OutreachRow | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [note, setNote] = useState(row.note);
  const [noteState, setNoteState] = useState("Saved");
  const [contact, setContact] = useState(row.contact ?? "");
  const noteTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  useEffect(() => {
    let live = true;
    setFull(null);
    setProblem(null);
    setNote(row.note);
    setContact(row.contact ?? "");
    client
      .get(row.slug)
      .then((detail) => live && (detail ? setFull(detail) : setProblem("This company isn't in the table anymore.")))
      .catch(() => live && setProblem("Couldn't load the full details. The basics are below."));
    return () => {
      live = false;
    };
    // Only reload when a different company opens; saves update `row` in place.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row.slug, client]);

  const detail = full ?? row;
  const { company, draft } = detail;
  const round = raiseOf(detail);
  const best = contactFor({ ...detail, contact: null });

  function changeNote(value: string) {
    setNote(value);
    setNoteState("Saving…");
    if (noteTimer.current) clearTimeout(noteTimer.current);
    noteTimer.current = setTimeout(async () => {
      const saved = await onSave([row.slug], { note: value }).catch(() => null);
      setNoteState(saved?.ok ? "Saved" : (saved && !saved.ok && saved.error) || "Not saved. Try again.");
    }, 700);
  }

  async function saveContact() {
    const value = contact.trim();
    if (value === (row.contact ?? "")) return;
    const saved = await onSave([row.slug], { contact: value || null });
    if (!saved.ok) setProblem(saved.error);
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" aria-label="Close" onClick={onClose} className={`absolute inset-0 cursor-default bg-ms-ink/20 transition-opacity duration-200 ${shown ? "opacity-100" : "opacity-0"}`} />
      <aside
        data-lenis-prevent
        className={`absolute top-0 right-0 bottom-0 w-full max-w-[36rem] overflow-y-auto overscroll-contain bg-white px-5 pt-5 pb-24 shadow-[-24px_0_64px_rgb(23_25_28_/_0.12)] transition-transform duration-300 ease-out sm:px-7 ${
          shown ? "translate-x-0" : "translate-x-full"
        } motion-reduce:transition-none`}
      >
        <header className="flex items-start gap-4">
          <Logo row={detail} size={60} />
          <div className="min-w-0">
            <h2 id={titleId} className="text-[24px] leading-tight font-semibold tracking-[-0.03em] text-ms-ink">
              {company.name}
            </h2>
            <p className="mt-1 text-[14px] text-ms-muted">
              <span className="mr-1.5 rounded-md bg-ms-mist px-1.5 font-mono text-[11px] font-medium text-ms-body">{company.batchShort}</span>
              {company.oneLiner}
            </p>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Close" className="ml-auto h-9 w-9 shrink-0 cursor-pointer rounded-full border border-ms-mist text-[18px] leading-none">
            ×
          </button>
        </header>

        <div className="mt-5">
          <StatusSelect row={row} onChange={(status: OutreachStatus) => onSave([row.slug], { status })} />
        </div>
        {problem && <p className="mt-3 rounded-xl bg-[#fbe7e5] px-3 py-2 text-[13px] text-[#8f2a22]">{problem}</p>}

        {company.description && (
          <Section title="What they do">
            <p className="text-[14px] whitespace-pre-line text-ms-body">{company.description}</p>
          </Section>
        )}

        <Section title="Who to email">
          <ul className="flex flex-col divide-y divide-dashed divide-ms-mist">
            {company.founders.map((founder) => {
              const linkedin = safeUrl(founder.linkedin);
              const x = safeUrl(founder.x);
              return (
                <li key={founder.name} className="grid grid-cols-[2.75rem_minmax(0,1fr)] gap-3 py-3">
                  <Initials name={founder.name} size={44} />
                  <div className="min-w-0">
                    <p className="flex flex-wrap items-center gap-1.5 font-semibold text-ms-ink">
                      {founder.name}
                      <span className="text-[12px] font-normal text-ms-muted/70">{founder.title}</span>
                      {linkedin && <IconLink name="linkedin" url={linkedin} label={`${founder.name} on LinkedIn`} />}
                      {x && <IconLink name="x" url={x} label={`${founder.name} on X`} />}
                    </p>
                    {founder.bio && <p className="mt-0.5 mb-1.5 text-[13px] text-ms-muted">{founder.bio}</p>}
                    {founder.email ? (
                      <p className="flex min-w-0 items-center gap-2">
                        <span className="truncate font-mono text-[12.5px] text-ms-ink">{founder.email}</span>
                        {founder.emailSource && <SourcePill source={founder.emailSource} />}
                        <button type="button" onClick={() => onCopy(founder.email ?? "")} className="cursor-pointer text-[12px] font-semibold text-ms-green">
                          copy
                        </button>
                      </p>
                    ) : (
                      <p className="text-[13px] text-ms-muted">No address found</p>
                    )}
                    {founder.emailSource === "guess" && founder.guesses?.length ? (
                      <p className="mt-1 font-mono text-[11.5px] text-ms-muted/70">if that bounces: {founder.guesses.join(" · ")}</p>
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          {company.inboxes?.length ? (
            <ul className="mt-3 flex flex-col gap-1">
              {company.inboxes.map((inbox) => (
                <li key={inbox.email} className="flex items-center justify-between gap-3 text-[13px]">
                  <span className="truncate font-mono text-ms-ink">{inbox.email}</span>
                  <span className="text-ms-muted/70">inbox · {inbox.via}</span>
                </li>
              ))}
            </ul>
          ) : null}
          <label className="mt-4 block text-[12px] font-semibold tracking-[0.06em] text-ms-muted uppercase" htmlFor={`${titleId}-to`}>
            Send to (override)
          </label>
          <input
            id={`${titleId}-to`}
            type="email"
            value={contact}
            placeholder={best?.email ?? "name@company.com"}
            onChange={(event) => setContact(event.target.value)}
            onBlur={saveContact}
            className="mt-2 w-full rounded-xl border border-ms-mist px-3 py-2.5 font-mono text-[13px] outline-none focus:border-ms-green"
          />
          <p className="mt-1.5 text-[12px] text-ms-muted/70">Empty uses the best address found{company.mailProvider ? ` · mail: ${company.mailProvider}` : ""}.</p>
        </Section>

        <Section title="Why they might want students">
          {company.fitRoles?.length ? <p className="text-[13px] text-ms-body">Tracks: {company.fitRoles.join(" · ")}</p> : null}
          {company.jobs?.length ? (
            <ul className="mt-2 flex flex-col divide-y divide-ms-mist">
              {company.jobs.map((job) => {
                const url = safeUrl(job.url);
                return (
                  <li key={`${job.title}-${job.url}`} className="flex items-center justify-between gap-3 py-2 text-[13px]">
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer" className="text-ms-ink underline-offset-2 hover:underline">
                        {job.title}
                      </a>
                    ) : (
                      <span className="text-ms-ink">{job.title}</span>
                    )}
                    <span className="shrink-0 text-ms-muted/70">{[job.type, job.role].filter(Boolean).join(" · ")}</span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[13px] text-ms-muted">No open roles on YC.</p>
          )}
          {company.launches?.length ? <p className="mt-2 text-[12px] text-ms-muted/70">Launched: {company.launches.join(" · ")}</p> : null}
        </Section>

        <Section title="Funding">
          {round ? (
            <>
              <p className="text-[14px] text-ms-ink">
                <strong className="font-mono">{round.amountLabel}</strong> {round.round ?? "round"}
                {round.investors?.length ? ` · ${round.investors.join(", ")}` : ""}
                {round.date ? <span className="text-ms-muted"> · {round.date}</span> : null}
              </p>
              {round.evidence && (
                <p className="mt-1.5 text-[13px] text-ms-muted">
                  “{round.evidence}”
                  {safeUrl(round.sourceUrl) && (
                    <>
                      {" · "}
                      <a href={safeUrl(round.sourceUrl) ?? undefined} target="_blank" rel="noopener noreferrer" className="font-medium text-ms-green underline-offset-2 hover:underline">
                        {round.sourceTitle ?? "source"}
                      </a>
                    </>
                  )}
                </p>
              )}
              <p className="mt-1.5 text-[12px] text-ms-muted/70">Known total ≈ {money(YC_DEAL_USD + (round.amountUsd ?? 0))}, with YC&apos;s $500K.</p>
            </>
          ) : (
            <p className="text-[13px] text-ms-muted">
              YC standard deal, $500K.{" "}
              {detail.funding?.status === "unchecked" ? "Not searched for an announced round yet." : "No announced round found in a quick web search."}
            </p>
          )}
        </Section>

        <Section title="Links">
          <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
            {linksOf(detail).map((link) => (
              <a key={link.key} href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-ms-mist px-3 py-2 text-[13px] font-medium text-ms-body hover:border-ms-muted/40">
                <Icon name={link.key} />
                {LINK_LABEL[link.key]}
              </a>
            ))}
          </div>
        </Section>

        <Section title="Draft email">
          {draft ? (
            <>
              {claimsAboutMatthew(detail) && <p className="mb-2 rounded-xl bg-[#fbf1dc] px-3 py-2 text-[13px] font-medium text-[#7a4f00]">This opener says something about you. Only approve it if it&apos;s true.</p>}
              <div className="overflow-hidden rounded-[16px] border border-ms-mist">
                <p className="bg-ms-mist/60 px-4 py-2.5 font-semibold text-ms-ink">{draft.subject}</p>
                <pre className="px-4 py-3 font-[inherit] text-[14px] whitespace-pre-wrap text-ms-body">{draft.body}</pre>
              </div>
              <p className="mt-2 text-[12px] text-ms-muted/70">
                {draft.style ? `Style: ${draft.style}` : ""}
                {draft.factsUsed?.length ? ` · based on ${draft.factsUsed.join("; ")}` : ""}
              </p>
              <button type="button" onClick={() => onCopy(`${draft.subject}\n\n${draft.body}`)} className="mt-3 h-9 cursor-pointer rounded-full border border-ms-mist px-4 text-[13px] font-semibold text-ms-body hover:bg-ms-mist">
                Copy draft
              </button>
            </>
          ) : (
            <p className="text-[13px] text-ms-muted">No draft for this company.</p>
          )}
        </Section>

        <Section title="Notes">
          <textarea
            value={note}
            onChange={(event) => changeNote(event.target.value)}
            placeholder="Who you know there, what you saw in their videos, timing…"
            className="min-h-24 w-full resize-y rounded-xl border border-ms-mist px-3 py-2.5 text-[14px] outline-none focus:border-ms-green"
          />
          <p className="mt-1.5 text-[12px] text-ms-muted/70" aria-live="polite">
            {noteState}
          </p>
        </Section>
      </aside>
    </div>
  );
}
