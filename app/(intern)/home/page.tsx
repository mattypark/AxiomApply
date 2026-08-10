import { HomeDashboard } from "@/components/intern/HomeDashboard";
import { getMyApplicationStatus } from "@/lib/applications";
import { getProfile, getUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { Article, Internship, Video } from "@/types/database";

export const metadata = { title: "Home" };
export const revalidate = 300;

/** Supabase seeds display_name with the email address; that is not a name. */
function realName(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed.includes("@")) return null;
  return trimmed;
}

export default async function InternHomePage() {
  let internships: Internship[] = [];
  let articles: Article[] = [];
  let videos: Video[] = [];
  let savedCount = 0;

  if (hasSupabaseEnv) {
    const supabase = await getServerSupabase();
    if (supabase) {
      const [feedRes, articleRes, videoRes, userRes] = await Promise.all([
        supabase
          .from("internships")
          .select("*")
          .eq("is_open", true)
          .order("featured", { ascending: false })
          .order("first_seen_at", { ascending: false })
          .limit(5),
        supabase
          .from("articles")
          .select("*")
          .eq("published", true)
          .order("published_at", { ascending: false })
          .limit(4),
        supabase
          .from("videos")
          .select("*")
          .eq("published", true)
          .order("order_index")
          .limit(12),
        supabase.auth.getUser(),
      ]);

      internships = (feedRes.data as Internship[]) ?? [];
      articles = (articleRes.data as Article[]) ?? [];
      videos = (videoRes.data as Video[]) ?? [];

      const user = userRes.data.user;
      if (user) {
        const { count } = await supabase
          .from("saved_internships")
          .select("internship_id", { count: "exact", head: true })
          .eq("user_id", user.id);
        savedCount = count ?? 0;
      }
    }
  }

  const [profile, user, applicationStatus] = await Promise.all([
    getProfile(),
    getUser(),
    getMyApplicationStatus(),
  ]);

  // The "what gets you matched" checklist, derived from what the account and
  // the application actually contain — never a static list.
  const signals = [
    {
      label: "Add your school and year",
      href: "/account",
      done: Boolean(profile?.school && profile?.grade),
      hint: "Two fields in Account. Takes ten seconds.",
    },
    {
      label: "Pick the fields you want",
      href: "/account",
      done: (profile?.preferred_fields?.length ?? 0) > 0,
      hint: "We match on interest first — tell us what you actually want.",
    },
    {
      label: "Link a GitHub or portfolio",
      href: "/account",
      done: Boolean(profile?.github || profile?.linkedin || profile?.social),
      hint: "A link beats a description. This is the strongest signal.",
    },
    {
      label: "Say what you are looking for",
      href: "/account",
      done: Boolean(profile?.looking_for),
      hint: "One sentence about the role you want.",
    },
    {
      label: "Save five internships",
      href: "/internships",
      done: savedCount >= 5,
      hint: `${savedCount} saved so far — saving teaches the feed what to show you.`,
    },
    {
      label: "Submit your application",
      href: "/apply",
      done: Boolean(applicationStatus),
      hint: "The network runs through it. A person reads every one.",
    },
  ];

  return (
    <HomeDashboard
      // An email is not a name — the greeting drops to a generic welcome
      // rather than shouting someone's address back at them.
      displayName={realName(profile?.display_name)}
      avatarUrl={profile?.avatar_url ?? null}
      applicationStatus={applicationStatus}
      internships={internships}
      articles={articles}
      videos={videos}
      savedCount={savedCount}
      signals={signals}
    />
  );
}
