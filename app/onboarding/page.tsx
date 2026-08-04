import { redirect } from "next/navigation";
import { OnboardingApplication } from "@/components/apply/OnboardingApplication";
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
  const profile = await getProfile();
  if (profile?.role === "intern") redirect("/home");
  if (profile?.role === "startup") redirect("/startup/home");

  const user = await getUser();

  // OAuth from a gate returns to ?side=..., so the picker is skipped and the
  // applicant lands back inside the application they were filling in.
  const { side } = await searchParams;
  const initialSide =
    side === "intern" || side === "startup" ? side : undefined;

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
