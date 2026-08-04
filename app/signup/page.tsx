import { redirect } from "next/navigation";

export const metadata = { title: "Sign up" };

/**
 * Sign-up moved into the application flow: Get started → /onboarding → the
 * gate inside the application is where the account gets created. This route
 * survives only for old links.
 */
export default function SignupPage() {
  redirect("/");
}
