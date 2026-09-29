import type { Metadata } from "next";
import { RocketMessage } from "@/components/RocketMessage";

/**
 * Where /auth/callback sends a sign-in that couldn't finish. The usual cause
 * is starting on one address (localhost, a preview link) and landing on
 * another, whose half of the handshake is missing: starting again from this
 * site fixes it. Nothing an applicant typed lives in the sign-in, so nothing
 * is lost either way.
 */
export const metadata: Metadata = {
  title: "Sign-in didn’t finish",
  robots: { index: false, follow: false },
};

export default function AuthErrorPage() {
  return (
    <RocketMessage
      kicker="Sign-in"
      title="That sign-in didn’t take off."
      primary={{ href: "/auth", label: "Try again" }}
      secondary={{ href: "/onboarding?start=1", label: "Apply without an account" }}
    >
      <p>
        Nothing you filled in is lost. Start the sign-in again from this page and it should go straight through, or carry
        on without an account.
      </p>
    </RocketMessage>
  );
}
