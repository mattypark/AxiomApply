import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassButton } from "@/components/glass/GlassButton";
import { ArticleEditor } from "@/components/admin/ArticleEditor";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { deleteArticle, publishArticle } from "@/lib/actions/articles";
import type { Article } from "@/types/database";

export const metadata = { title: "Edit article — Admin" };
export const dynamic = "force-dynamic";

export default async function EditArticlePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = getAdminSupabase();
  if (!supabase) notFound();

  const { data } = await supabase.from("articles").select("*").eq("id", id).single();
  if (!data) notFound();
  const article = data as Article;

  return (
    <main className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          href="/admin/articles"
          className="text-[0.85rem] text-muted transition-colors hover:text-ink"
        >
          ← All articles
        </Link>
        <div className="flex items-center gap-3">
          {article.published && (
            <Link
              href={`/articles/${article.slug}`}
              className="text-[0.85rem] font-medium text-forest hover:text-forest-deep"
            >
              View live ↗
            </Link>
          )}
          <form action={publishArticle}>
            <input type="hidden" name="id" value={article.id} />
            <input type="hidden" name="publish" value={String(!article.published)} />
            <GlassButton tone={article.published ? "glass" : "forest"} type="submit">
              {article.published ? "Unpublish" : "Publish"}
            </GlassButton>
          </form>
          <form action={deleteArticle}>
            <input type="hidden" name="id" value={article.id} />
            <button
              type="submit"
              className="text-[0.85rem] text-muted transition-colors hover:text-error"
            >
              Delete
            </button>
          </form>
        </div>
      </div>

      <ArticleEditor article={article} />
    </main>
  );
}
