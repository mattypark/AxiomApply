import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { LearnModule } from "@/types/database";

export const metadata = {
  title: "Learn",
  description:
    "Short skills tracks — AI, computer science, marketing — the skills startups actually hire interns for.",
};

export const revalidate = 300;

const TRACK_LABELS: Record<string, string> = {
  ai: "AI",
  cs: "Computer Science",
  marketing: "Marketing",
  finance: "Finance",
  startups: "Startups",
};

export default async function LearnPage() {
  let modules: LearnModule[] = [];
  if (hasSupabaseEnv) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("learn_modules")
        .select("*")
        .eq("published", true)
        .order("track")
        .order("order_index");
      modules = (data as LearnModule[]) ?? [];
    }
  }

  const tracks = modules.reduce<Record<string, LearnModule[]>>((acc, m) => {
    (acc[m.track] ??= []).push(m);
    return acc;
  }, {});

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Learn</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold tracking-tight text-ink">
            Skills that get you picked.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[52ch] text-muted">
            Short, practical tracks on the skills the startups in our network
            actually hire interns for. No fluff, no prerequisites.
          </p>
        </Reveal>
      </div>

      {modules.length === 0 ? (
        <GlassPanel className="p-7">
          <p className="max-w-[52ch] leading-relaxed text-muted">
            First modules are being written — AI, computer science, and
            marketing tracks land here.
          </p>
        </GlassPanel>
      ) : (
        Object.entries(tracks).map(([track, mods], ti) => (
          <section key={track} className="flex flex-col gap-3">
            <Reveal delay={0.1 + ti * 0.05}>
              <span className="kicker">{TRACK_LABELS[track] ?? track}</span>
            </Reveal>
            {mods.map((m, i) => (
              <Reveal key={m.id} delay={0.14 + ti * 0.05 + i * 0.04}>
                <GlassPanel
                  specular
                  className="transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
                >
                  <Link
                    href={`/learn/${m.slug}`}
                    className="flex items-baseline gap-4 p-6"
                  >
                    <span className="font-mono text-[0.72rem] tracking-[0.08em] text-forest">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 text-[1.05rem] font-semibold tracking-tight text-ink">
                      {m.title}
                    </span>
                    <span className="text-forest">→</span>
                  </Link>
                </GlassPanel>
              </Reveal>
            ))}
          </section>
        ))
      )}
    </main>
  );
}
