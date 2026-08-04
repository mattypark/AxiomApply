import { redirect } from "next/navigation";

export const metadata = { title: "Sign in" };

/**
 * Sign-in lives in the application gate now (Continue with Google on
 * /onboarding). Old links land on the welcome page. The OAuth callback at
 * /auth/callback is separate and untouched.
 */
export default function AuthPage() {
  redirect("/");
}
