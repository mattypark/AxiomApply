import { redirect } from "next/navigation";
import { EnterShell } from "@/components/onboarding/EnterShell";
import { EnterFlow } from "@/components/onboarding/EnterFlow";
import { isSide } from "@/lib/apply-sides";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = { title: "Welcome" };

/**
 * Where Enter lands.
 *
 * Public by design: nobody needs an account to apply, and the account is
 * offered rather than demanded. The side comes from ?side= — intern is the
 * default because that is who arrives here from the homepage, and the other
 * two are a line of text inside rather than a screen of their own.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string }>;
}) {
  const { side } = await searchParams;
  const requested = isSide(side) ? side : undefined;

  const profile = await getProfile();

  // An explicit side wins over the role redirect: an intern who wants to start
  // a chapter must not be bounced to /home before seeing the form. Chapters
  // are additive, so having a role cannot rule one out.
  if (!requested) {
    if (profile?.role === "intern") redirect("/home");
    if (profile?.role === "startup") redirect("/startup/home");
  }

  const user = await getUser();

  return (
    <EnterShell>
      <EnterFlow
        side={requested ?? "intern"}
        prefill={{
          name: profile?.display_name ?? undefined,
          email: user?.email ?? undefined,
          isSignedIn: Boolean(user),
        }}
      />
    </EnterShell>
  );
}
