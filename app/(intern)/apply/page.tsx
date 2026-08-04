import { InternApplication } from "@/components/apply/InternApplication";
import { getProfile, getUser } from "@/lib/auth";

export const metadata = {
  title: "Apply",
  description:
    "Apply to Axiom Pathways — get dropped into a real startup, picked for what you've shipped, not your credentials.",
};

/**
 * The intern application, inside the workspace shell.
 *
 * It lives in the (intern) group on purpose: the rail, header and account
 * chrome stay put, so applying is a destination within the product rather
 * than a page that replaces it. `chrome="embedded"` tells the engine to drop
 * its own rail and scroll containers and flow with the page instead.
 */
export default async function ApplyPage() {
  const user = await getUser();
  const profile = user ? await getProfile() : null;

  return (
    <InternApplication
      chrome="embedded"
      backHref={user ? "/home" : "/"}
      prefill={{
        name: profile?.display_name ?? undefined,
        email: user?.email ?? undefined,
        isSignedIn: Boolean(user),
      }}
    />
  );
}
