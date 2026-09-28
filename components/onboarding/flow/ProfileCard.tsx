"use client";

import type { QuestionSet } from "@/lib/apply-sections";
import { startups } from "@/lib/site-data";
import { useFullLook } from "@/components/onboarding/flow/look";
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
 *
 * On the full-page flow it is one of the welcome page's white cards: bigger
 * radius, a soft drop instead of a hairline, and the path colour for the
 * avatar, the chips and the fill.
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
    titleFallback: "Your name",
    subtitle: ["school", "grade"],
    chips: ["interest", "chapter"],
    line: "startup_role",
    rows: [
      { id: "github", label: "GitHub" },
      { id: "other_link", label: "Work" },
      { id: "linkedin", label: "LinkedIn" },
      { id: "resume", label: "Resume", file: true },
    ],
    picks: "startup_picks",
  },
  startup: {
    title: "company",
    titleFallback: "Your startup",
    subtitle: ["stage", "location"],
    line: "one_liner",
    chips: ["fields_needed"],
    rows: [
      { id: "contact_name", label: "Contact" },
      { id: "website", label: "Website" },
      { id: "hours", label: "Hours / week" },
      { id: "location_mode", label: "Setup" },
    ],
  },
  chapter: {
    title: "name",
    titleFallback: "Your name",
    subtitle: ["school", "grade"],
    chips: ["school_type", "cadence"],
    line: "qualified",
    rows: [
      { id: "city", label: "Based in" },
      { id: "advisor_status", label: "Advisor" },
      { id: "hours", label: "Hours / week" },
      { id: "how_long", label: "Running it for" },
    ],
  },
};

/** Class sets for the two looks. Same structure, different clothes. */
const LOOK = {
  full: {
    card: "rounded-[28px] bg-white p-6 shadow-[0_40px_80px_-44px_rgb(23_25_28_/_0.45)]",
    meta: "text-[12px] text-ms-muted",
    track: "mt-2.5 h-1.5 overflow-hidden rounded-full bg-ms-sky-soft",
    fill: "bg-[var(--path-em)]",
    avatar: "h-12 w-12 bg-ms-sky-soft text-[20px] font-semibold text-ms-green",
    title: "text-[18px] font-medium tracking-[-0.02em] text-ms-ink",
    fallback: "text-ms-muted",
    subtitle: "text-[13px] text-ms-muted",
    line: "text-[14px] leading-[20px] text-ms-body",
    chip: "rounded-full bg-ms-sky-soft px-2.5 py-1 text-[12px] font-medium text-ms-green",
    rule: "border-ms-ink/[0.07]",
    label: "text-ms-muted",
    value: "text-ms-ink",
    pick: "rounded-full bg-ms-mist px-2.5 py-1 text-[12px] text-ms-ink",
    skeleton: "bg-[var(--path-ground-2)]",
  },
  embedded: {
    card: "rounded-[16px] bg-app-card p-5 shadow-[inset_0_0_0_1px_var(--color-app-line-strong),0_24px_60px_-24px_rgb(0_0_0_/_0.8)]",
    meta: "text-[11px] text-app-text-3",
    track: "mt-2 h-[3px] overflow-hidden rounded-full bg-app-sunken",
    fill: "bg-app-accent",
    avatar: "h-11 w-11 bg-app-sunken font-display text-[20px] text-app-accent",
    title: "text-[17px] text-app-text-1",
    fallback: "text-app-text-3",
    subtitle: "text-[12px] text-app-text-3",
    line: "text-[13px] leading-[19px] text-app-text-2",
    chip: "rounded-[6px] bg-app-accent/[0.12] px-2 py-0.5 text-[11px] text-app-accent",
    rule: "border-app-line",
    label: "text-app-text-3",
    value: "text-app-text-2",
    pick: "rounded-full bg-app-sunken px-2.5 py-1 text-[11px] text-app-text-2",
    skeleton: "bg-app-hover",
  },
};

function Skeleton({ width, tone }: { width: string; tone: string }) {
  return <span className={`inline-block h-2 rounded-full ${tone}`} style={{ width }} />;
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
  const look = LOOK[useFullLook() ? "full" : "embedded"];
  const spec = SPECS[setKey];
  const get = (id: string) => (answers[id] ?? "").trim();

  const title = get(spec.title);
  const subtitle = spec.subtitle.map(get).filter(Boolean).join(" · ");
  const line = spec.line ? get(spec.line) : "";
  const chips = spec.chips.flatMap((id) => splitValues(get(id)));
  const picks = spec.picks ? splitValues(get(spec.picks)).filter((pick) => pick !== "Other") : [];
  const percent = Math.round(completion * 100);
  const bar = (width: string) => <Skeleton width={width} tone={look.skeleton} />;

  return (
    <div className={look.card}>
      <div className={`flex items-center justify-between ${look.meta}`}>
        <span>What a founder sees</span>
        <span className="tabular-nums">{percent}%</span>
      </div>
      <div className={look.track}>
        {/* Slides in from the left by transform, like the flight path's trail. */}
        <div
          className={`h-full rounded-full transition-transform duration-700 ease-mask ${look.fill}`}
          style={{ transform: `translateX(${percent - 100}%)` }}
        />
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span aria-hidden="true" className={`grid shrink-0 place-items-center rounded-full ${look.avatar}`}>
          {title ? title[0].toUpperCase() : ""}
        </span>
        <span className="min-w-0">
          <span className={`block truncate ${look.title}`}>
            {title ? <Arrive value={title} /> : <span className={look.fallback}>{spec.titleFallback}</span>}
          </span>
          <span className={`mt-1 block truncate ${look.subtitle}`}>
            {subtitle ? <Arrive value={subtitle} /> : bar("7rem")}
          </span>
        </span>
      </div>

      {line ? (
        <p className={`mt-4 line-clamp-3 ${look.line}`}>
          <Arrive value={line} />
        </p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {bar("100%")}
          {bar("70%")}
        </div>
      )}

      <div className="mt-4 flex min-h-[22px] flex-wrap gap-1.5">
        {chips.length ? (
          chips.map((chip) => (
            <span key={chip} className={`ax-toast-in ${look.chip}`}>
              {chip}
            </span>
          ))
        ) : (
          <>
            {bar("3rem")}
            {bar("4.5rem")}
          </>
        )}
      </div>

      <dl className={`mt-5 flex flex-col gap-2.5 border-t pt-4 ${look.rule}`}>
        {spec.rows.map((row) => {
          const value = row.file ? (files[row.id]?.name ?? "") : get(row.id);
          return (
            <div key={row.id} className="flex items-center justify-between gap-4 text-[12px]">
              <dt className={`shrink-0 ${look.label}`}>{row.label}</dt>
              <dd className={`min-w-0 truncate text-right ${look.value}`}>
                {value ? <Arrive value={value} /> : bar("4rem")}
              </dd>
            </div>
          );
        })}
      </dl>

      {spec.picks ? (
        <div className={`mt-5 border-t pt-4 ${look.rule}`}>
          <p className={look.meta}>Wants to work at</p>
          <div className="mt-2.5 flex min-h-[28px] flex-wrap gap-1.5">
            {picks.length
              ? picks.map((pick) => {
                  const startup = startups.find((entry) => entry.name === pick);
                  return (
                    <span key={pick} className={`ax-toast-in ${look.pick}`}>
                      {startup?.name ?? pick.replace(/^Other:\s*/, "")}
                    </span>
                  );
                })
              : bar("6rem")}
          </div>
        </div>
      ) : null}
    </div>
  );
}
