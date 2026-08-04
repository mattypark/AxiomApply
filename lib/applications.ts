import { getServerSupabase } from "@/lib/supabase/server";
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
 * applied (or aren't signed in). Drives the Apply tab in the dock and the
 * prefill on /account.
 *
 * No `.eq("user_id", …)` filter: RLS already scopes this to rows the caller
 * owns, and it matches on the verified JWT email too — so an application filed
 * before the account existed still comes back.
 *
 * Returns null rather than throwing when the table hasn't been migrated yet,
 * so the dock keeps rendering on a database that predates 0013.
 */
export async function getMyApplication(): Promise<MyApplication | null> {
  const user = await getUser();
  if (!user) return null;

  const supabase = await getServerSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("applications")
    .select(MY_APPLICATION_COLUMNS)
    .order("submitted_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) return null;
  return (data as MyApplication | null) ?? null;
}

/** Just the status — what the rail and the tab bar need. */
export async function getMyApplicationStatus(): Promise<ApplicationStatus | null> {
  const application = await getMyApplication();
  return application?.status ?? null;
}
