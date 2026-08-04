import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { Reveal } from "@/components/motion/Reveal";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Article } from "@/types/database";

export const metadata = {
  title: "Articles",
  description:
    "Two articles a day on landing internships, what startups want, and building Axiom.",
};

export const revalidate = 300;

export default async function ArticlesPage() {
  let articles: Article[] = [];
  if (hasSupabaseEnv) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const { data } = await supabase
        .from("articles")
        .select("*")
        .eq("published", true)
        .order("published_at", { ascending: false })
        .limit(60);
      articles = (data as Article[]) ?? [];
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 py-6">
      <div>
        <Reveal>
          <span className="kicker">Articles</span>
        </Reveal>
        <Reveal delay={0.06}>
          <h1 className="mt-2 text-[clamp(1.8rem,4.5vw,2.6rem)] font-semibold tracking-tight text-ink">
            Two a day, every day.
          </h1>
        </Reveal>
        <Reveal delay={0.12}>
          <p className="mt-2 max-w-[50ch] text-muted">
            How students actually land internships, what startups look for,
            and what we&apos;re learning building Axiom.
          </p>
        </Reveal>
      </div>

      <section className="flex flex-col gap-3">
        {articles.length === 0 ? (
          <GlassPanel className="p-7">
            <p className="max-w-[52ch] leading-relaxed text-muted">
              First posts are on the way — the writing desk just opened.
            </p>
          </GlassPanel>
        ) : (
          articles.map((a, i) => (
            <Reveal key={a.id} delay={Math.min(i * 0.05, 0.4)}>
              <GlassPanel
                specular
                className="transition-[transform,box-shadow] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-hover)]"
              >
                <Link href={`/articles/${a.slug}`} className="block p-6">
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <h2 className="text-[1.15rem] font-semibold tracking-tight text-ink">
                      {a.title}
                    </h2>
                    {a.published_at && (
                      <time
                        dateTime={a.published_at}
                        className="font-mono text-[0.7rem] text-muted"
                      >
                        {new Date(a.published_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    )}
                  </div>
                  {a.excerpt && (
                    <p className="mt-1.5 text-[0.92rem] leading-relaxed text-muted">
                      {a.excerpt}
                    </p>
                  )}
                  {a.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {a.tags.slice(0, 4).map((t) => (
                        <span key={t} className="chip">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              </GlassPanel>
            </Reveal>
          ))
        )}
      </section>
    </main>
  );
}
