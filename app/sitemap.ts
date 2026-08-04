import type { MetadataRoute } from "next";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

const BASE = "https://axiomapply.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/home",
    "/internships",
    "/learn",
    "/articles",
    "/apply",
    "/for-startups",
    "/contact",
    "/social",
    "/privacy",
    "/terms",
    "/cookies",
  ].map((p) => ({
    url: `${BASE}${p}`,
    changeFrequency:
      p === "/internships" || p === "/articles"
        ? "daily"
        : p === "/privacy" || p === "/terms" || p === "/cookies"
          ? "yearly"
          : "weekly",
    priority: p === "" ? 1 : p === "/privacy" || p === "/terms" || p === "/cookies" ? 0.3 : 0.7,
  }));

  if (!hasSupabaseEnv) return staticRoutes;
  const supabase = await getServerSupabase();
  if (!supabase) return staticRoutes;

  const [{ data: articles }, { data: modules }] = await Promise.all([
    supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("published", true)
      .limit(1000),
    supabase.from("learn_modules").select("slug").eq("published", true).limit(200),
  ]);

  return [
    ...staticRoutes,
    ...(articles ?? []).map((a) => ({
      url: `${BASE}/articles/${a.slug}`,
      lastModified: a.updated_at as string,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
    ...(modules ?? []).map((m) => ({
      url: `${BASE}/learn/${m.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
