import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import type { Article, Internship, Video } from "@/types/database";
import type { ApplicationStatus } from "@/lib/applications";
import { LocalApplicationBadge } from "@/components/intern/LocalApplicationBadge";

/**
 * The intern workspace home.
 *
 * Structured like the dashboards this sits next to in a student's tab bar —
 * ElevenLabs' home, Linear's inbox: a greeting, a row of destinations, then
 * two columns of live content. Every tile is real data or an honest empty
 * state; nothing here is decorative filler.
 *
 * Sections, in priority order:
 *   1. greeting + application status — the one thing they came to check
 *   2. quick actions — the four things they can do right now
 *   3. profile strength — concrete, checkable steps that improve their odds
 *   4. fresh internships / latest articles — the live feed, two columns
 */

export function HomeDashboard({
  displayName,
  avatarUrl,
  applicationStatus,
  internships,
  articles,
  videos,
  savedCount,
}: {
  displayName: string | null;
  avatarUrl: string | null;
  applicationStatus: ApplicationStatus | null;
  internships: Internship[];
  articles: Article[];
  videos: Video[];
  savedCount: number;
}) {
  const firstName = displayName?.trim().split(/\s+/)[0];

  return (
    <div className="flex flex-col gap-10">
      {/* greeting + status */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          {avatarUrl && (
            <Link
              href="/account"
              aria-label="Your account"
              className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_30px_rgba(26,26,26,0.16)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <Image
                src={avatarUrl}
                alt=""
                fill
                sizes="56px"
                className="object-cover"
                unoptimized
              />
            </Link>
          )}
          <div>
            <p className="font-mono text-[0.66rem] tracking-[0.2em] text-faint uppercase">
              Your workspace
            </p>
            <h1 className="mt-2 text-[clamp(1.8rem,3.6vw,2.6rem)] leading-[1.05] font-semibold tracking-tight text-ink">
              {firstName ? `Welcome back, ${firstName}.` : "Welcome to Axiom."}
            </h1>
          </div>
        </div>
        <span className="flex flex-wrap items-center gap-3">
          <LocalApplicationBadge serverKnows={Boolean(applicationStatus)} />
          <ApplicationPill status={applicationStatus} />
        </span>
      </header>

      {/* quick actions */}
      <section aria-label="Quick actions" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ActionTile
          href="/apply"
          icon="✎"
          title={applicationStatus ? "Your application" : "Apply to the network"}
          body={
            applicationStatus
              ? "Check status and add anything you have shipped since."
              : "One application, read by a person. 14 days either way."
          }
          accent
        />
        <ActionTile
          href="/internships"
          icon="◈"
          title="Browse the feed"
          body="Live listings pulled daily. Open to everyone, no gate."
        />
        <ActionTile
          href="/learn"
          icon="▤"
          title="Start a track"
          body={`${videos.length || "Several"} lessons across AI, engineering and marketing.`}
        />
        <ActionTile
          href="/articles"
          icon="❐"
          title="Read up"
          body="How students actually land internships, and what startups look for."
        />
      </section>

      {/* two columns of live content */}
      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <section aria-label="Fresh internships" className="flex flex-col gap-3">
          <SectionHead
            title="Fresh internships"
            href="/internships"
            meta={savedCount > 0 ? `${savedCount} saved` : undefined}
          />
          {internships.length === 0 ? (
            <Card>
              <p className="text-[0.9rem] text-muted">
                The feed fills the moment the daily pull runs — check back
                shortly.
              </p>
            </Card>
          ) : (
            internships.slice(0, 5).map((internship) => (
              <Link
                key={internship.id}
                href="/internships"
                className="group flex items-start justify-between gap-4 rounded-2xl bg-white/70 px-5 py-4 shadow-[0_1px_0_rgba(21,21,15,0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[0.95rem] font-medium text-ink">
                    {internship.role}
                  </span>
                  <span className="mt-1 block truncate text-[0.85rem] text-muted">
                    {internship.company}
                    {internship.locations.length > 0
                      ? ` · ${internship.locations[0]}`
                      : ""}
                  </span>
                </span>
                <span
                  aria-hidden
                  className="mt-1 shrink-0 text-[0.9rem] text-faint transition-[color,transform] duration-300 group-hover:translate-x-0.5 group-hover:text-forest"
                >
                  →
                </span>
              </Link>
            ))
          )}
        </section>

        <section aria-label="Latest articles" className="flex flex-col gap-3">
          <SectionHead title="Latest reading" href="/articles" />
          {articles.length === 0 ? (
            <Card>
              <p className="text-[0.9rem] text-muted">
                First posts are on the way — the writing desk just opened.
              </p>
            </Card>
          ) : (
            articles.slice(0, 4).map((article) => (
              <Link
                key={article.id}
                href={`/articles/${article.slug}`}
                className="group rounded-2xl bg-white/70 px-5 py-4 shadow-[0_1px_0_rgba(21,21,15,0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-0.5 hover:shadow-[var(--shadow-float)]"
              >
                <span className="block text-[0.95rem] font-medium text-ink">
                  {article.title}
                </span>
                {article.excerpt && (
                  <span className="mt-1 block line-clamp-2 text-[0.85rem] leading-relaxed text-muted">
                    {article.excerpt}
                  </span>
                )}
              </Link>
            ))
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* pieces                                                              */
/* ------------------------------------------------------------------ */

function Card({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-[22px] bg-white/70 p-6 shadow-[0_1px_0_rgba(21,21,15,0.06)]">
      {children}
    </div>
  );
}

function SectionHead({
  title,
  href,
  meta,
}: {
  title: string;
  href: string;
  meta?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <h2 className="text-[1.05rem] font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <span className="flex items-baseline gap-4">
        {meta && (
          <span className="font-mono text-[0.62rem] tracking-[0.14em] text-faint uppercase">
            {meta}
          </span>
        )}
        <Link
          href={href}
          className="text-[0.85rem] font-medium text-forest transition-colors hover:text-forest-deep"
        >
          See all →
        </Link>
      </span>
    </div>
  );
}

function ActionTile({
  href,
  icon,
  title,
  body,
  accent,
}: {
  href: string;
  icon: string;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex flex-col gap-3 rounded-[22px] p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 ${
        accent
          ? "bg-forest text-white shadow-[0_10px_30px_rgba(47,107,61,0.28)]"
          : "bg-white/70 shadow-[0_1px_0_rgba(21,21,15,0.06)] hover:shadow-[var(--shadow-float)]"
      }`}
    >
      <span
        aria-hidden
        className={`grid h-9 w-9 place-items-center rounded-xl text-[1rem] ${
          accent ? "bg-white/15 text-white" : "bg-ink/[0.05] text-ink"
        }`}
      >
        {icon}
      </span>
      <span>
        <span
          className={`block text-[0.95rem] font-medium ${
            accent ? "text-white" : "text-ink"
          }`}
        >
          {title}
        </span>
        <span
          className={`mt-1 block text-[0.82rem] leading-relaxed ${
            accent ? "text-white/75" : "text-muted"
          }`}
        >
          {body}
        </span>
      </span>
    </Link>
  );
}

const STATUS_COPY: Record<ApplicationStatus, { label: string; tone: string }> = {
  applied: { label: "Application in review", tone: "chip-forest" },
  waitlist: { label: "Waitlisted", tone: "chip" },
  accepted: { label: "Accepted — check your email", tone: "chip-forest" },
  rejected: { label: "Not this cycle", tone: "chip" },
  withdrawn: { label: "Withdrawn", tone: "chip" },
};

function ApplicationPill({ status }: { status: ApplicationStatus | null }) {
  if (!status) {
    return (
      <Link
        href="/apply"
        className="chip chip-forest transition-transform duration-300 hover:-translate-y-0.5"
      >
        No application yet →
      </Link>
    );
  }

  // Falls back rather than throwing: status is a database string, and a value
  // added to the CHECK constraint before this map is updated must not take the
  // whole dashboard down.
  const copy = STATUS_COPY[status] ?? {
    label: "Application submitted",
    tone: "chip",
  };
  return <span className={copy.tone}>{copy.label}</span>;
}
