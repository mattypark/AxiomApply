import { getMyApplicationStatus } from "@/lib/applications";
import { getProfile, getUser } from "@/lib/auth";
import { getServerSupabase } from "@/lib/supabase/server";

/**
 * "What gets you matched" — the steps that measurably improve an application,
 * derived from what the account and the application actually contain. Never a
 * static list: every item is checked against real data.
 *
 * Lives here rather than in a page because the checklist is pinned to the
 * workspace shell and follows the applicant across every screen.
 */

export type MatchSignal = {
  label: string;
  hint: string;
  done: boolean;
  /** Where this gets fixed. */
  href: string;
};

export async function getMatchSignals(): Promise<MatchSignal[] | null> {
  const user = await getUser();
  // Signed out there is nothing to complete, so the checklist stays hidden.
  if (!user) return null;

  const [profile, applicationStatus] = await Promise.all([
    getProfile(),
    getMyApplicationStatus(),
  ]);

  let savedCount = 0;
  const supabase = await getServerSupabase();
  if (supabase) {
    const { count } = await supabase
      .from("saved_internships")
      .select("internship_id", { count: "exact", head: true })
      .eq("user_id", user.id);
    savedCount = count ?? 0;
  }

  return [
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
}
