import { GlassPanel } from "@/components/glass/GlassPanel";
import { SaveButton } from "@/components/intern/SaveButton";
import { CompanyLogo } from "@/components/intern/CompanyLogo";
import type { Internship } from "@/types/database";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** One hue per season, used for the chip, the left rail, and the logo tile. */
const SEASON_CLASS: Record<string, string> = {
  summer: "season-summer",
  fall: "season-fall",
  winter: "season-winter",
  spring: "season-spring",
};

export function InternshipCard({
  internship: i,
  saved,
  canSave,
}: {
  internship: Internship;
  saved: boolean;
  canSave: boolean;
}) {
  const isNew = Date.now() - new Date(i.first_seen_at).getTime() < WEEK_MS;
  const seasonClass = SEASON_CLASS[i.season] ?? "season-summer";
  const host = hostOf(i.url);

  return (
    <GlassPanel
      specular
      className={`season-rail ${seasonClass} transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]`}
    >
      <div className="flex items-start gap-4 p-5 pl-6 sm:p-6 sm:pl-7">
        <CompanyLogo company={i.company} url={i.url} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <a
              href={i.url ?? "#"}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[1.05rem] font-semibold tracking-tight text-ink transition-colors hover:text-forest"
            >
              {i.company}
            </a>
            {isNew && <span className="chip chip-forest">NEW</span>}
            {!i.is_open && <span className="chip text-faint">closed</span>}
          </div>

          <p className="mt-0.5 text-[0.92rem] leading-snug text-muted">
            {i.role}
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <span className="chip chip-season capitalize">
              {i.season}
              {i.year ? ` ${i.year}` : ""}
            </span>
            {i.locations.slice(0, 3).map((loc) => (
              <span key={loc} className="chip">
                {loc}
              </span>
            ))}
            {i.locations.length > 3 && (
              <span className="chip">+{i.locations.length - 3} more</span>
            )}
            {i.sponsorship && i.sponsorship !== "Other" && (
              <span className="chip">{i.sponsorship}</span>
            )}
          </div>

          {/* Links row — the actual destinations, not just a clickable title. */}
          {i.url && (
            <div className="mt-3.5 flex flex-wrap items-center gap-x-4 gap-y-1.5">
              <a
                href={i.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1 text-[0.82rem] font-medium text-[var(--season)] transition-colors hover:opacity-80"
              >
                Apply on {host ?? "the listing"}
                <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                  ↗
                </span>
              </a>
              {host && (
                <a
                  href={`https://${host}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[0.7rem] tracking-[0.04em] text-faint transition-colors hover:text-muted"
                >
                  {host}
                </a>
              )}
            </div>
          )}
        </div>

        <SaveButton internshipId={i.id} saved={saved} canSave={canSave} />
      </div>
    </GlassPanel>
  );
}

/** `https://jobs.example.com/x?y=1` → `jobs.example.com` */
function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return null;
  }
}
