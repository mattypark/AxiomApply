import { redirect } from "next/navigation";
import { OnboardingApplication } from "@/components/apply/OnboardingApplication";
import { isSide } from "@/lib/apply-sides";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = { title: "Welcome" };

/**
 * The side picker, then the application — same engine as /apply.
 *
 * Public by design: Get started lands here with no account, and the account is
 * created later inside the application's own gate (name + email + Google).
 * Signed-in users who already picked a side skip straight to their HQ.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string }>;
}) {
  // OAuth from a gate returns to ?side=..., so the picker is skipped and the
  // applicant lands back inside the application they were filling in.
  const { side } = await searchParams;
  const initialSide = isSide(side) ? side : undefined;

  const profile = await getProfile();

  // An explicit side wins over the role redirect. Without this an intern who
  // wanted to start a chapter would be bounced to /home before they ever saw
  // the form — chapters are additive, so having a role cannot rule one out.
  if (!initialSide) {
    if (profile?.role === "intern") redirect("/home");
    if (profile?.role === "startup") redirect("/startup/home");
  }

  const user = await getUser();

  return (
    <OnboardingApplication
      initialSide={initialSide}
      prefill={{
        name: profile?.display_name ?? undefined,
        email: user?.email ?? undefined,
        isSignedIn: Boolean(user),
      }}
    />
  );
}
