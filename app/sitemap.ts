import type { MetadataRoute } from "next";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { CAREER_ROLES } from "@/lib/careers";

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
    "/careers",
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

  // Roles are static content, so they are listed whether or not Supabase is up.
  const roleRoutes: MetadataRoute.Sitemap = CAREER_ROLES.filter((r) => r.open).map(
    (role) => ({
      url: `${BASE}/careers/${role.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }),
  );

  if (!hasSupabaseEnv) return [...staticRoutes, ...roleRoutes];
  const supabase = await getServerSupabase();
  if (!supabase) return [...staticRoutes, ...roleRoutes];

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
    ...roleRoutes,
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
