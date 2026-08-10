"use client";

import { useRef } from "react";
import { Rule, useLineFill } from "@/components/apply/Rule";

/**
 * The right-hand panel on /apply and /onboarding.
 *
 * Every image is a placeholder at /public/apply/slot-N.svg — same convention as
 * the welcome screen's shot-N. Drop a real photo or a poster frame in at the
 * same path and the layout does not move. `kind: "video"` swaps the <img> for a
 * <video> once `src` points at a real file.
 */

type Panel = {
  slot?: number;
  eyebrow: string;
  title: string;
  body: string;
  /**
   * "image"     placeholder tile at /public/apply/slot-N.svg (default)
   * "founders"  the two real founder photos, side by side
   * "logo"      the Axiom mark, centred on a cream tile
   * "statement" no image — the title runs huge, bold and centred
   */
  kind?: "image" | "founders" | "logo" | "statement";
};

const FOUNDER_PHOTOS = [
  { src: "/welcome/founders/matthew.jpg", name: "Matthew", focus: "50% 32%" },
  { src: "/welcome/founders/frank.jpg", name: "Frank", focus: "49% 40%" },
];

type Stat = {
  value: string;
  label: string;
};

const INTERN_STATS: Stat[] = [
  { value: "600+", label: "in the network" },
  { value: "10+", label: "startups placing" },
  { value: "12,597", label: "live listings" },
];

const STARTUP_STATS: Stat[] = [
  { value: "600+", label: "interns to pick from" },
  { value: "2–4", label: "candidates per request" },
  { value: "by hand", label: "every match" },
];

const INTERN_PANELS: Panel[] = [
  {
    kind: "founders",
    eyebrow: "who runs this",
    title: "Matthew and Frank.",
    body: "Two high schoolers who got tired of internships that only went to people who already knew someone. A person reads your application — that person is one of us.",
  },
  {
    kind: "logo",
    eyebrow: "who we are",
    title: "Axiom Pathways.",
    body: "A nonprofit that places high schoolers and early-college students into real startup work. Chapters, a learning track, and a network we match by hand.",
  },
  {
    // Text only: the placeholder tile said nothing the copy did not, and a
    // grey box reads as a broken image.
    kind: "statement",
    eyebrow: "who gets in",
    title: "Numbers get you in.",
    body: "The applications that win attach metrics to what they made: users, views, revenue, downloads, members. Tip — put a number on every project you list. “40 people used it” moves you up the pile more than any adjective.",
  },
  {
    kind: "statement",
    eyebrow: "fair warning",
    title: "Most applicants are not matched.",
    body: "Seats are few, so a no is the common outcome — it is not a verdict on you. Still learning? Apply anyway: we take interns who are still learning. And a match is not the only way out of here — we help you get internships either way, through the feed, Learn, and feedback on your application.",
  },
];

const STARTUP_PANELS: Panel[] = [
  {
    kind: "founders",
    eyebrow: "who reads this",
    title: "Matthew reads every one.",
    body: "Startup applications are reviewed by hand before anything goes live. You will hear from a person, usually within a few days.",
  },
  {
    // Placeholder until the intern-list home page ships — then this becomes a
    // screenshot of the list, and later a clip of scrolling through it.
    slot: 2,
    eyebrow: "who you get",
    title: "600+ interns.",
    body: "High schoolers and college students — including interns from Stanford and Harvard — selected for obsession rather than credentials. Read the projects before the schools.",
  },
  {
    slot: 3,
    eyebrow: "how matching works",
    title: "By hand, not a firehose.",
    body: "We go through interests first: what you need, then what they want. Where those overlap is the match — two to four candidates, not two hundred résumés to sort.",
  },
  {
    slot: 4,
    eyebrow: "what works",
    title: "One narrow, real thing.",
    body: "The founders who get the most out of this hand an intern something shippable in week one. “Help out with growth” goes badly for everyone.",
  },
  {
    kind: "statement",
    eyebrow: "the fine print",
    title: "Most interns are minors.",
    body: "Some parents or guardians may sign agreements — it depends on the role. Interns who are underage work as educational interns. And plenty are not minors at all: we have college interns too, Stanford and Harvard among them.",
  },
];

export function MediaPanel({
  variant,
  embedded = false,
}: {
  variant: "intern" | "startup";
  /** Inside the workspace shell the page scrolls, so this does not. */
  embedded?: boolean;
}) {
  const panels = variant === "intern" ? INTERN_PANELS : STARTUP_PANELS;
  const stats = variant === "intern" ? INTERN_STATS : STARTUP_STATS;

  // The panel scrolls on its own, so it drives its own line-fill rules.
  const asideRef = useRef<HTMLElement>(null);
  useLineFill(asideRef, [variant]);

  return (
    <aside
      ref={asideRef}
      // See ApplyEngine: Lenis must not swallow this container's wheel events.
      data-lenis-prevent={embedded ? undefined : ""}
      aria-label="About Axiom Pathways"
      className={`hidden w-full max-w-[420px] shrink-0 border-l border-l-[var(--ap-line)] px-8 lg:block ${
        embedded
          ? "py-2 pl-10"
          : "h-dvh overflow-y-auto overscroll-contain py-14"
      }`}
    >
      <div>
        <dl className="flex flex-wrap gap-x-10 gap-y-4">
          {stats.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd className="font-mono text-[1.5rem] leading-none tracking-tight text-ink">
                {stat.value}
              </dd>
              <p className="mt-1.5 font-mono text-[0.64rem] tracking-[0.16em] text-faint uppercase">
                {stat.label}
              </p>
            </div>
          ))}
        </dl>
        <div className="mt-6">
          <Rule variant="divider" />
        </div>
      </div>

      <div className="mt-12 flex flex-col gap-16">
        {panels.map((panel) => (
          <figure key={panel.title}>
            {panel.kind === "founders" ? (
              <div className="grid grid-cols-2 gap-3">
                {FOUNDER_PHOTOS.map((founder) => (
                  <div
                    key={founder.name}
                    className="overflow-hidden rounded-[22px] shadow-[var(--shadow-float)]"
                  >
                    <img
                      src={founder.src}
                      alt={founder.name}
                      loading="lazy"
                      decoding="async"
                      className="aspect-[3/4] w-full object-cover"
                      style={{ objectPosition: founder.focus }}
                    />
                  </div>
                ))}
              </div>
            ) : panel.kind === "logo" ? (
              // Bare mark, no tile — the cream box and its outline read as a
              // missing image rather than a logo.
              <div className="flex justify-center py-6">
                <img
                  src="/axiom-mark.png"
                  alt="Axiom Pathways"
                  width={200}
                  height={200}
                  loading="lazy"
                  decoding="async"
                  className="h-44 w-44 object-contain"
                />
              </div>
            ) : panel.kind === "statement" ? null : (
              <div className="overflow-hidden rounded-[22px] shadow-[var(--shadow-float)]">
                <img
                  src={`/apply/slot-${panel.slot}.svg`}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  width={600}
                  height={460}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            {panel.kind === "statement" ? (
              <figcaption className="py-6 text-center">
                <p className="font-mono text-[0.64rem] tracking-[0.16em] text-faint uppercase">
                  {panel.eyebrow}
                </p>
                <p className="mx-auto mt-4 max-w-[14ch] text-[2rem] leading-[1.05] font-bold tracking-tight text-ink">
                  {panel.title}
                </p>
                <p className="mx-auto mt-4 max-w-[44ch] text-[0.9rem] leading-relaxed text-muted">
                  {panel.body}
                </p>
              </figcaption>
            ) : (
              <figcaption className="mt-5">
                <p className="font-mono text-[0.64rem] tracking-[0.16em] text-faint uppercase">
                  {panel.eyebrow}
                </p>
                <p className="mt-2 text-[1.05rem] font-semibold leading-snug tracking-tight text-ink">
                  {panel.title}
                </p>
                <p className="mt-2 text-[0.9rem] leading-relaxed text-muted">
                  {panel.body}
                </p>
              </figcaption>
            )}
            <div className="mt-6">
              <Rule />
            </div>
          </figure>
        ))}
      </div>
    </aside>
  );
}
