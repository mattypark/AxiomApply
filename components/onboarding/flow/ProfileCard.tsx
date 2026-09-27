"use client";

import type { QuestionSet } from "@/lib/apply-sections";
import { startups } from "@/lib/site-data";
import { splitValues, type Answers, type Files } from "@/components/onboarding/flow/useApplication";

/**
 * The profile that assembles itself beside the questions.
 *
 * This is the retention device: every answer visibly lands somewhere, and the
 * card is recognisably what a founder will be shown. Empty slots are drawn as
 * skeleton bars (the same ones as the landing's applicant pile), so the card
 * reads as filling in rather than as a form summary.
 *
 * Each set says which answers go where. Values are shown as typed — nothing
 * here edits or reformats what gets sent.
 */

type Spec = {
  title: string;
  titleFallback: string;
  subtitle: string[];
  line?: string;
  chips: string[];
  rows: { id: string; label: string; file?: boolean }[];
  picks?: string;
};

const SPECS: Record<QuestionSet["key"], Spec> = {
  intern: {
    title: "name",
    titleFallback: "your name",
    subtitle: ["school", "grade"],
    chips: ["interest", "chapter"],
    line: "startup_role",
    rows: [
      { id: "github", label: "github" },
      { id: "other_link", label: "work" },
      { id: "linkedin", label: "linkedin" },
      { id: "resume", label: "resume", file: true },
    ],
    picks: "startup_picks",
  },
  startup: {
    title: "company",
    titleFallback: "your startup",
    subtitle: ["stage", "location"],
    line: "one_liner",
    chips: ["fields_needed"],
    rows: [
      { id: "contact_name", label: "contact" },
      { id: "website", label: "website" },
      { id: "hours", label: "hours / week" },
      { id: "location_mode", label: "setup" },
    ],
  },
  chapter: {
    title: "name",
    titleFallback: "your name",
    subtitle: ["school", "grade"],
    chips: ["school_type", "cadence"],
    line: "qualified",
    rows: [
      { id: "city", label: "based in" },
      { id: "advisor_status", label: "advisor" },
      { id: "hours", label: "hours / week" },
      { id: "how_long", label: "running it for" },
    ],
  },
};

function Skeleton({ width }: { width: string }) {
  return <span className="inline-block h-2 rounded-full bg-app-hover" style={{ width }} />;
}

/** Keyed on the value so each new answer arrives with the toast-in motion. */
function Arrive({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span key={value} className={`ax-toast-in ${className}`}>
      {value}
    </span>
  );
}

export function ProfileCard({
  setKey,
  answers,
  files,
  completion,
}: {
  setKey: QuestionSet["key"];
  answers: Answers;
  files: Files;
  /** 0–1: share of visible questions answered. */
  completion: number;
}) {
  const spec = SPECS[setKey];
  const get = (id: string) => (answers[id] ?? "").trim();

  const title = get(spec.title);
  const subtitle = spec.subtitle.map(get).filter(Boolean).join(" · ");
  const line = spec.line ? get(spec.line) : "";
  const chips = spec.chips.flatMap((id) => splitValues(get(id)));
  const picks = spec.picks ? splitValues(get(spec.picks)).filter((pick) => pick !== "Other") : [];
  const percent = Math.round(completion * 100);

  return (
    <div className="rounded-[16px] bg-app-card p-5 shadow-[inset_0_0_0_1px_var(--color-app-line-strong),0_24px_60px_-24px_rgb(0_0_0_/_0.8)]">
      <div className="flex items-center justify-between text-[11px] text-app-text-3">
        <span>what a founder sees</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-app-sunken">
        <div
          className="h-full rounded-full bg-app-accent transition-[width] duration-700 ease-mask"
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span
          aria-hidden="true"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-app-sunken font-display text-[20px] text-app-accent"
        >
          {title ? title[0].toUpperCase() : ""}
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[17px] text-app-text-1">
            {title ? <Arrive value={title} /> : <span className="text-app-text-3">{spec.titleFallback}</span>}
          </span>
          <span className="mt-1 block truncate text-[12px] text-app-text-3">
            {subtitle ? <Arrive value={subtitle.toLowerCase()} /> : <Skeleton width="7rem" />}
          </span>
        </span>
      </div>

      {line ? (
        <p className="mt-4 line-clamp-3 text-[13px] leading-[19px] text-app-text-2">
          <Arrive value={line} />
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          <Skeleton width="100%" />
          <Skeleton width="70%" />
        </div>
      )}

      <div className="mt-4 flex min-h-[22px] flex-wrap gap-1.5">
        {chips.length ? (
          chips.map((chip) => (
            <span
              key={chip}
              className="ax-toast-in rounded-[6px] bg-app-accent/[0.12] px-2 py-0.5 text-[11px] text-app-accent"
            >
              {chip.toLowerCase()}
            </span>
          ))
        ) : (
          <>
            <Skeleton width="3rem" />
            <Skeleton width="4.5rem" />
          </>
        )}
      </div>

      <dl className="mt-5 flex flex-col gap-2.5 border-t border-app-line pt-4">
        {spec.rows.map((row) => {
          const value = row.file ? (files[row.id]?.name ?? "") : get(row.id);
          return (
            <div key={row.id} className="flex items-center justify-between gap-4 text-[12px]">
              <dt className="shrink-0 text-app-text-3">{row.label}</dt>
              <dd className="min-w-0 truncate text-right text-app-text-2">
                {value ? <Arrive value={value} /> : <Skeleton width="4rem" />}
              </dd>
            </div>
          );
        })}
      </dl>

      {spec.picks ? (
        <div className="mt-5 border-t border-app-line pt-4">
          <p className="text-[11px] text-app-text-3">wants to work at</p>
          <div className="mt-2.5 flex min-h-[28px] flex-wrap gap-1.5">
            {picks.length ? (
              picks.map((pick) => {
                const startup = startups.find((entry) => entry.name === pick);
                return (
                  <span
                    key={pick}
                    className="ax-toast-in rounded-full bg-app-sunken px-2.5 py-1 text-[11px] text-app-text-2"
                  >
                    {startup?.name ?? pick.replace(/^Other:\s*/, "")}
                  </span>
                );
              })
            ) : (
              <Skeleton width="6rem" />
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
