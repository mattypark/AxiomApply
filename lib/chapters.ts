import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";

/**
 * Chapter lookups.
 *
 * Modelled on lib/applications.ts, and for the same reason: chapter
 * applications are usually filed signed-out, so the row carries an email and a
 * null user_id until the person makes an account. Matching on either, then
 * claiming the orphan, is what stops a founder from signing in and being told
 * they never applied.
 *
 * Nothing here reads profiles.role. A chapter lead may also be an intern or a
 * startup — the two are independent by design.
 */

export type ChapterStatus =
  | "applied"
  | "review"
  | "approved"
  | "rejected"
  | "withdrawn";

export type MyChapter = {
  status: ChapterStatus;
  submitted_at: string;
  name: string | null;
  email: string;
  school: string | null;
  city: string | null;
  cadence: string | null;
  advisor_status: string | null;
  advisor_name: string | null;
  first_members: string | null;
  startups_local: string | null;
  also_interested: string | null;
};

const MY_CHAPTER_COLUMNS =
  "status, submitted_at, name, email, school, city, cadence, advisor_status, " +
  "advisor_name, first_members, startups_local, also_interested";

export async function getMyChapter(): Promise<MyChapter | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const email = user.email?.toLowerCase().trim();
  const filter = email
    ? `user_id.eq.${user.id},email.ilike.${email}`
    : `user_id.eq.${user.id}`;

  const { data, error } = await supabase
    .from("chapter_applications")
    .select(`id, user_id, ${MY_CHAPTER_COLUMNS}`)
    .or(filter)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // An unmigrated database is not an error worth throwing at a page render —
  // it just means nobody has a chapter yet.
  if (error || !data) return null;

  const row = data as unknown as MyChapter & {
    id: string;
    user_id: string | null;
  };

  // Fire and forget: the read already succeeded, and a failed claim just means
  // the next read matches by email again.
  if (!row.user_id) {
    void claimChapter(row.id, user.id);
  }

  return row;
}

/**
 * Attach an orphaned chapter application to the account that owns its email.
 *
 * Needs the service-role client: the table has no UPDATE policy for
 * anon/authenticated (approval is Axiom's to grant), so a scoped client cannot
 * write user_id even on its own row.
 */
async function claimChapter(chapterId: string, userId: string): Promise<void> {
  const admin = getAdminSupabase();
  if (!admin) return;
  await admin
    .from("chapter_applications")
    .update({ user_id: userId })
    .eq("id", chapterId)
    .is("user_id", null);
}

/** Just enough for a nav item — does this person run a chapter at all? */
export async function hasChapter(): Promise<boolean> {
  return (await getMyChapter()) !== null;
}
