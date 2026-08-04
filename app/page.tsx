import { Preloader } from "@/components/welcome/Preloader";
import { WelcomeHero } from "@/components/welcome/WelcomeHero";
import { WelcomeSections } from "@/components/welcome/WelcomeSections";
import { getProfile, getUser } from "@/lib/auth";

// Welcome screen. The previous landing is still reachable at /classic while
// the two are being compared.
export default async function WelcomePage() {
  const [user, profile] = await Promise.all([getUser(), getProfile()]);

  // Get started goes straight to the side picker — no email step first. The
  // account gets created later, inside the application's own gate. Signed-in
  // users with a side already picked go to their HQ.
  const ctaHref = !profile?.role
    ? "/onboarding"
    : profile.role === "startup"
      ? "/startup/home"
      : "/home";

  return (
    <>
      <Preloader />
      <WelcomeHero signedIn={Boolean(user)} ctaHref={ctaHref} />
      <WelcomeSections />
    </>
  );
}
