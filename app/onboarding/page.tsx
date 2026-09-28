import { redirect } from "next/navigation";
import { EnterFlow } from "@/components/onboarding/EnterFlow";
import { isSide } from "@/lib/apply-sides";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = { title: "Welcome" };

/**
 * Where Enter lands.
 *
 * Public by design: the account is offered first (Google) but never
 * demanded — "continue without an account" still reaches every question. The side comes from ?side= — intern is the
 * default because that is who arrives here from the homepage, and the other
 * two are a line of text inside rather than a screen of their own.
 */
export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ side?: string; start?: string }>;
}) {
  const { side, start } = await searchParams;
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
    <EnterFlow
      side={requested}
      // ?start=1: the home's apply block already chose "without an account".
      start={start === "1"}
      prefill={{
        // A fresh Google account has no profile name yet; Google's own is
        // the best first guess, and it never overwrites a typed answer.
        name:
          profile?.display_name ??
          (typeof user?.user_metadata?.full_name === "string"
            ? user.user_metadata.full_name
            : undefined),
        email: user?.email ?? undefined,
        isSignedIn: Boolean(user),
      }}
    />
  );
}
