import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { ArticleBody } from "@/components/markdown/ArticleBody";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Article } from "@/types/database";
import type { Metadata } from "next";

export const revalidate = 300;

async function getArticle(slug: string): Promise<Article | null> {
  if (!hasSupabaseEnv) return null;
  const supabase = await getServerSupabase();
  if (!supabase) return null;
  const { data } = await supabase
    .from("articles")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  return (data as Article) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: "Article" };
  return {
    title: article.title,
    description: article.excerpt ?? undefined,
    openGraph: article.cover_url ? { images: [article.cover_url] } : undefined,
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-6">
      <div>
        <Link
          href="/articles"
          className="text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
        >
          ← All articles
        </Link>
        <h1 className="mt-6 text-balance text-[clamp(1.9rem,5vw,2.9rem)] font-semibold leading-tight tracking-tight text-ink">
          {article.title}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {article.published_at && (
            <time
              dateTime={article.published_at}
              className="font-mono text-[0.72rem] tracking-[0.08em] text-muted uppercase"
            >
              {new Date(article.published_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
          )}
          {article.tags.map((t) => (
            <span key={t} className="chip">
              {t}
            </span>
          ))}
        </div>
      </div>

      {article.cover_url && (
        <Image
          src={article.cover_url}
          alt=""
          width={1200}
          height={630}
          className="h-auto w-full rounded-3xl"
          unoptimized
        />
      )}

      <GlassPanel variant="deep" className="p-7 sm:p-10">
        <ArticleBody markdown={article.body_md} />
      </GlassPanel>

      <GlassPanel specular className="flex flex-wrap items-center justify-between gap-4 p-6">
        <p className="max-w-[36ch] text-[0.95rem] text-muted">
          Ready to stop reading about internships and get one?
        </p>
        <Link
          href="/apply"
          className="rounded-full bg-forest px-6 py-3 text-[0.9rem] font-medium text-white shadow-[0_8px_24px_rgba(47,107,61,0.3)] transition-transform duration-300 hover:-translate-y-0.5"
        >
          Apply →
        </Link>
      </GlassPanel>
    </main>
  );
}
