import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassInput } from "@/components/glass/GlassInput";
import { Reveal } from "@/components/motion/Reveal";
import { InternshipCard } from "@/components/intern/InternshipCard";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { SEASONS, type Internship } from "@/types/database";

export const metadata = {
  title: "Internships",
  description:
    "Summer, fall, winter, and spring internships — refreshed automatically, with the resources to land them.",
};

export const revalidate = 300;

const PAGE_SIZE = 100;

type Search = { season?: string; q?: string };

export default async function InternshipsPage({
  searchParams,
}: {
  searchParams: Promise<Search>;
}) {
  const { season, q } = await searchParams;
  const activeSeason = SEASONS.find((s) => s === season) ?? null;
  const query = (q ?? "").replace(/[^\w\s.+#-]/g, "").trim();

  let internships: Internship[] = [];
  let savedIds = new Set<string>();
  let signedIn = false;

  const supabase = hasSupabaseEnv ? await getServerSupabase() : null;
  if (supabase) {
    let listQuery = supabase
      .from("internships")
      .select("*")
      .eq("is_open", true)
      .order("featured", { ascending: false })
      .order("first_seen_at", { ascending: false })
      .limit(PAGE_SIZE);
    if (activeSeason) listQuery = listQuery.eq("season", activeSeason);
    if (query) {
      listQuery = listQuery.or(`company.ilike.%${query}%,role.ilike.%${query}%`);
    }

    const [listRes, userRes] = await Promise.all([
      listQuery,
      supabase.auth.getUser(),
    ]);

    internships = (listRes.data as Internship[]) ?? [];

    const user = userRes.data.user;
    if (user) {
      signedIn = true;
      const { data: saves } = await supabase
        .from("saved_internships")
        .select("internship_id")
        .eq("user_id", user.id);
      savedIds = new Set((saves ?? []).map((s) => s.internship_id as string));
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Internships</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold tracking-tight text-ink">
            Fresh every season.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[52ch] text-muted">
            Pulled automatically from the best trackers and lists, refreshed
            daily. Save the ones you want — then{" "}
            <Link href="/apply" className="font-medium text-forest">
              apply through Axiom →
            </Link>
          </p>
        </Reveal>
      </div>

      {/* filters — URL as state */}
      <Reveal delay={0.16}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <FilterChip href="/internships" active={!activeSeason}>
              All seasons
            </FilterChip>
            {SEASONS.map((s) => (
              <FilterChip
                key={s}
                href={`/internships?season=${s}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
                active={activeSeason === s}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </FilterChip>
            ))}
          </div>
          <form method="GET" action="/internships" className="max-w-md">
            {activeSeason && <input type="hidden" name="season" value={activeSeason} />}
            <GlassInput
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search company or role…"
              aria-label="Search internships"
            />
          </form>
        </div>
      </Reveal>

      {/* feed */}
      <section className="flex flex-col gap-3">
        {internships.length === 0 ? (
          <GlassPanel className="p-7">
            <p className="max-w-[54ch] leading-relaxed text-muted">
              {hasSupabaseEnv
                ? query || activeSeason
                  ? "Nothing matches that filter yet — try widening it."
                  : "The feed is empty — sources haven't run yet. Check back soon."
                : "The live feed switches on once Supabase is configured (SETUP.md). Sources like the Simplify GitHub list and Interndock are already wired."}
            </p>
          </GlassPanel>
        ) : (
          internships.map((i) => (
            <InternshipCard
              key={i.id}
              internship={i}
              saved={savedIds.has(i.id)}
              canSave={signedIn}
            />
          ))
        )}
      </section>

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
      className={`rounded-full px-4 py-2 font-mono text-[0.72rem] tracking-[0.08em] transition-[background-color,color,transform] duration-300 hover:-translate-y-0.5 ${
        active
          ? "bg-forest text-white shadow-[0_6px_18px_rgba(47,107,61,0.3)]"
          : "bg-white/50 text-muted shadow-[inset_0_1px_0_rgba(255,255,255,0.6)] hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
