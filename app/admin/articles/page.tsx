import Link from "next/link";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { GlassButton } from "@/components/glass/GlassButton";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { createArticle } from "@/lib/actions/articles";
import type { Article } from "@/types/database";

export const metadata = { title: "Articles — Admin" };
export const dynamic = "force-dynamic";

export default async function AdminArticlesPage() {
  const supabase = getAdminSupabase();
  const { data } = supabase
    ? await supabase
        .from("articles")
        .select("id, slug, title, published, published_at, updated_at")
        .order("updated_at", { ascending: false })
    : { data: [] };
  const articles = (data as Pick<
    Article,
    "id" | "slug" | "title" | "published" | "published_at" | "updated_at"
  >[]) ?? [];

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Articles</h1>
        <form action={createArticle}>
          <GlassButton tone="forest" type="submit">
            + New article
          </GlassButton>
        </form>
      </div>

      <section className="flex flex-col gap-3">
        {articles.length === 0 && (
          <GlassPanel className="p-6">
            <p className="text-[0.92rem] text-muted">
              Nothing yet. Two a day starts with one.
            </p>
          </GlassPanel>
        )}
        {articles.map((a) => (
          <GlassPanel key={a.id} className="p-5">
            <Link
              href={`/admin/articles/${a.id}`}
              className="flex flex-wrap items-baseline justify-between gap-3"
            >
              <span className="font-semibold text-ink">{a.title}</span>
              <span className="flex items-center gap-3">
                <span className="chip">
                  {a.published
                    ? `published ${a.published_at ? new Date(a.published_at).toLocaleDateString() : ""}`
                    : "draft"}
                </span>
                <span className="font-mono text-[0.7rem] text-muted">
                  edited {new Date(a.updated_at).toLocaleDateString()}
                </span>
              </span>
            </Link>
          </GlassPanel>
        ))}
      </section>
    </main>
  );
}
