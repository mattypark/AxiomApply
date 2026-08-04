import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { getServerSupabase } from "@/lib/supabase/server";
import { getProfile } from "@/lib/auth";
import { FIELDS, SEASONS } from "@/types/database";

export const metadata = { title: "Interns" };

// Live directory. Reads public.intern_directory — a restricted view that only
// returns rows to an APPROVED startup and never exposes display_name (which
// holds the user's email). See supabase/migrations/0012_intern_directory.sql.
export const revalidate = 60;

const PAGE_SIZE = 60;

type DirectoryRow = {
  id: string;
  handle: string;
  school: string | null;
  grade: string | null;
  preferred_seasons: string[];
  preferred_fields: string[];
  experience: string | null;
  looking_for: string | null;
  github: string | null;
  linkedin: string | null;
  social: string | null;
  joined_at: string;
};

export default async function InternsPage({
  searchParams,
}: {
  searchParams: Promise<{ field?: string; season?: string; q?: string }>;
}) {
  const params = await searchParams;
  const profile = await getProfile();
  const supabase = await getServerSupabase();

  // Default the field filter to whatever this startup said it needs at
  // onboarding, so the first load is already relevant. "all" opts out.
  const startupFields = profile?.preferred_fields ?? [];
  const field =
    params.field ?? (startupFields.length === 1 ? startupFields[0] : undefined);
  const season = params.season;
  const q = params.q?.trim();

  let interns: DirectoryRow[] = [];

  if (supabase) {
    let query = supabase
      .from("intern_directory")
      .select("*")
      .order("joined_at", { ascending: false })
      .limit(PAGE_SIZE);

    if (field && field !== "all") query = query.contains("preferred_fields", [field]);
    if (season && season !== "all") query = query.contains("preferred_seasons", [season]);
    if (q) {
      // Parameterized per-column matches — no filter strings built from input.
      const safe = `%${q.replace(/[%_]/g, "")}%`;
      query = query.or(
        [`looking_for.ilike.${safe}`, `experience.ilike.${safe}`, `school.ilike.${safe}`].join(","),
      );
    }

    const { data } = await query;
    interns = (data as DirectoryRow[] | null) ?? [];
  }

  const filterHref = (patch: Record<string, string>) => {
    const sp = new URLSearchParams();
    if (field) sp.set("field", field);
    if (season) sp.set("season", season);
    if (q) sp.set("q", q);
    for (const [k, v] of Object.entries(patch)) {
      if (v === "all") sp.delete(k);
      else sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `/startup/interns?${s}` : "/startup/interns";
  };

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Interns</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.9rem,5vw,3rem)] font-semibold tracking-tight text-ink">
            Builders in the network.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[56ch] text-muted">
            Picked for what they&apos;ve shipped, not their credentials. Names
            and contact details stay private until you request an intro —
            everything else about their work is here.
          </p>
        </Reveal>
      </div>

      {/* filters */}
      <Reveal delay={0.16}>
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[0.64rem] tracking-[0.14em] text-faint uppercase">
              Field
            </span>
            <FilterChip href={filterHref({ field: "all" })} active={!field}>
              All
            </FilterChip>
            {FIELDS.map((f) => (
              <FilterChip key={f} href={filterHref({ field: f })} active={field === f}>
                {f}
              </FilterChip>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 font-mono text-[0.64rem] tracking-[0.14em] text-faint uppercase">
              Season
            </span>
            <FilterChip href={filterHref({ season: "all" })} active={!season}>
              Any
            </FilterChip>
            {SEASONS.map((s) => (
              <FilterChip key={s} href={filterHref({ season: s })} active={season === s}>
                {s}
              </FilterChip>
            ))}
          </div>
          <form action="/startup/interns" className="flex gap-2">
            {field && <input type="hidden" name="field" value={field} />}
            {season && <input type="hidden" name="season" value={season} />}
            <input
              name="q"
              defaultValue={q ?? ""}
              placeholder="Search what they're looking for, experience, school…"
              aria-label="Search interns"
              className="w-full rounded-full border border-white/50 bg-white/45 px-5 py-2.5 text-[0.9rem] text-ink outline-none placeholder:text-faint focus:border-forest/40"
            />
            <button
              type="submit"
              className="rounded-full bg-forest px-5 py-2.5 text-[0.85rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Search
            </button>
          </form>
        </div>
      </Reveal>

      <p className="font-mono text-[0.68rem] tracking-[0.12em] text-faint uppercase">
        {interns.length === PAGE_SIZE
          ? `${PAGE_SIZE}+ builders`
          : `${interns.length} ${interns.length === 1 ? "builder" : "builders"}`}
      </p>

      {interns.length === 0 ? (
        <Reveal delay={0.2}>
          <GlassPanel variant="deep" className="flex flex-col gap-3 p-8 text-center">
            <p className="text-[1.05rem] font-medium text-ink">
              Nobody matches that yet.
            </p>
            <p className="mx-auto max-w-[44ch] text-[0.9rem] leading-relaxed text-muted">
              Widen the filters, or tell us what you need and we&apos;ll match
              by hand — that&apos;s still the fastest route.
            </p>
            <Link
              href="/startup/home"
              className="mx-auto mt-1 rounded-full bg-forest px-6 py-3 text-[0.9rem] font-medium text-white transition-transform duration-300 hover:-translate-y-0.5"
            >
              Post what you need →
            </Link>
          </GlassPanel>
        </Reveal>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {interns.map((intern, i) => (
            <Reveal key={intern.id} delay={Math.min(0.2 + i * 0.03, 0.6)}>
              <InternCard intern={intern} />
            </Reveal>
          ))}
        </div>
      )}

      <Reveal delay={0.4}>
        <GlassPanel
          variant="deep"
          specular
          className="flex flex-wrap items-center justify-between gap-5 p-7"
        >
          <p className="max-w-[42ch] text-[1rem] leading-relaxed text-ink">
            Found someone? Request the intro and we&apos;ll make it — with their
            name, their email, and the work behind the links.
          </p>
          <Link
            href="/startup/home"
            className="rounded-full bg-forest px-6 py-3 text-[0.9rem] font-medium text-white shadow-[0_8px_24px_rgba(47,107,61,0.3)] transition-transform duration-300 hover:-translate-y-0.5"
          >
            Request an intro →
          </Link>
        </GlassPanel>
      </Reveal>
    </main>
  );
}

function FilterChip({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 font-mono text-[0.68rem] tracking-[0.08em] uppercase transition-colors duration-200 ${
        active
          ? "bg-forest text-white"
          : "bg-white/45 text-muted hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function InternCard({ intern }: { intern: DirectoryRow }) {
  const links = [
    intern.github && { label: "GitHub", value: intern.github },
    intern.linkedin && { label: "LinkedIn", value: intern.linkedin },
    intern.social && { label: "Social", value: intern.social },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <GlassPanel
      specular
      className="flex h-full flex-col gap-4 p-6 transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-[1.05rem] font-semibold tracking-tight text-ink">
          {intern.handle}
        </span>
        {intern.grade && (
          <span className="font-mono text-[0.64rem] tracking-[0.08em] text-muted uppercase">
            Grade {intern.grade}
          </span>
        )}
      </div>

      {intern.preferred_fields.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {intern.preferred_fields.map((f) => (
            <span key={f} className="chip chip-forest">
              {f}
            </span>
          ))}
        </div>
      )}

      {intern.looking_for && (
        <p className="text-[0.95rem] leading-relaxed text-ink">
          {intern.looking_for}
        </p>
      )}

      {intern.experience && (
        <p className="text-[0.88rem] leading-relaxed text-muted">
          {intern.experience}
        </p>
      )}

      <div className="mt-auto flex flex-col gap-2">
        {intern.preferred_seasons.length > 0 && (
          <span className="font-mono text-[0.64rem] tracking-[0.08em] text-muted uppercase">
            Available {intern.preferred_seasons.join(" · ")}
          </span>
        )}
        {links.length > 0 && (
          <div className="flex flex-wrap gap-3">
            {links.map((l) => (
              <span key={l.label} className="font-mono text-[0.68rem] text-forest">
                {l.label}: {l.value}
              </span>
            ))}
          </div>
        )}
        <span className="font-mono text-[0.64rem] tracking-[0.12em] text-faint uppercase">
          Name + contact on intro
        </span>
      </div>
    </GlassPanel>
  );
}
