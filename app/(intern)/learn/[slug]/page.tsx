import Link from "next/link";
import { notFound } from "next/navigation";
import { GlassPanel } from "@/components/glass/GlassPanel";
import { ArticleBody } from "@/components/markdown/ArticleBody";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { LearnModule } from "@/types/database";

export const revalidate = 300;

export default async function LearnModulePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!hasSupabaseEnv) notFound();
  const supabase = await getServerSupabase();
  if (!supabase) notFound();

  const { data } = await supabase
    .from("learn_modules")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .single();
  if (!data) notFound();
  const mod = data as LearnModule;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col gap-8 py-6">
      <div>
        <Link
          href="/learn"
          className="text-[0.85rem] text-muted transition-[color,transform] duration-300 hover:-translate-x-1 hover:text-ink"
        >
          ← All tracks
        </Link>
        <span className="kicker mt-6 block">{mod.track}</span>
        <h1 className="mt-2 text-balance text-[clamp(1.9rem,5vw,2.9rem)] font-semibold leading-tight tracking-tight text-ink">
          {mod.title}
        </h1>
      </div>

      <GlassPanel variant="deep" className="p-7 sm:p-10">
        <ArticleBody markdown={mod.body_md} />
      </GlassPanel>
    </main>
  );
}
