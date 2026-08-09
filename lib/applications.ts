import { getServerSupabase } from "@/lib/supabase/server";
import { getAdminSupabase } from "@/lib/supabase/admin";
import { getUser } from "@/lib/auth";

/**
 * The Sheet's own vocabulary, lowercased — the exact CHECK constraint in
 * 0013_applications.sql. These strings come out of Postgres verbatim, so any
 * UI map keyed on this type must use them and nothing else.
 */
export type ApplicationStatus =
  | "applied"
  | "waitlist"
  | "accepted"
  | "rejected"
  | "withdrawn";

/**
 * One application row, as far as the applicant's own UI cares about it. Not
 * the whole table: the review columns (reviewer, decision_reason, guardian_*)
 * are Axiom's side of the conversation and are never read here.
 */
export type MyApplication = {
  status: ApplicationStatus;
  submitted_at: string;
  name: string | null;
  phone: string | null;
  school: string | null;
  grade: string | null;
  interest: string | null;
  startup_role: string | null;
  github: string | null;
  linkedin: string | null;
  instagram: string | null;
};

const MY_APPLICATION_COLUMNS =
  "status, submitted_at, name, phone, school, grade, interest, startup_role, github, linkedin, instagram";

/**
 * The signed-in user's most recent application, or null if they have never
 * applied (or aren't signed in). Drives the Apply tab, the rail status and the
 * "what gets you matched" progress.
 *
 * Matches on user_id OR email, explicitly.
 *
 * Most applications are filed signed-out — the form works without an account —
 * so the row carries an email and a null user_id. Relying on RLS alone to
 * connect the two was fragile: anything that changed the JWT email claim, or
 * any row inserted with a differently-cased address, left the applicant
 * looking at 0% progress and "no application yet" after signing in.
 *
 * When a row is found by email, its user_id is claimed so the link is
 * permanent and later reads are a straight index hit.
 *
 * Returns null rather than throwing when the table hasn't been migrated yet,
 * so the rail keeps rendering on a database that predates 0013.
 */
export async function getMyApplication(): Promise<MyApplication | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const email = user.email?.toLowerCase().trim();
  const filter = email
    ? `user_id.eq.${user.id},email.ilike.${email}`
    : `user_id.eq.${user.id}`;

  const { data, error } = await supabase
    .from("applications")
    .select(`id, user_id, ${MY_APPLICATION_COLUMNS}`)
    .or(filter)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;

  const row = data as MyApplication & { id: string; user_id: string | null };

  // Claim an application that was filed before this account existed. Fire and
  // forget: the read already succeeded, and a failed claim just means the next
  // read matches by email again.
  if (!row.user_id) {
    void claimApplication(row.id, user.id);
  }

  return row;
}

/**
 * Attach an orphaned application to the account that owns its email address.
 *
 * Needs the service-role client: the table deliberately has no UPDATE policy
 * for anon/authenticated (status is Axiom's to set, never the applicant's), so
 * a scoped client cannot write user_id even on its own row.
 */
async function claimApplication(
  applicationId: string,
  userId: string,
): Promise<void> {
  const admin = getAdminSupabase();
  if (!admin) return;

  await admin
    .from("applications")
    .update({ user_id: userId })
    .eq("id", applicationId)
    .is("user_id", null);
}

/** Just the status — what the rail and the tab bar need. */
export async function getMyApplicationStatus(): Promise<ApplicationStatus | null> {
  const application = await getMyApplication();
  return application?.status ?? null;
}
