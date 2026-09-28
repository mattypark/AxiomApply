import { GradientHero } from "@/components/hero/GradientHero";
import { RocketLayer } from "@/components/rocket/RocketLayer";
import { WelcomeSections } from "@/components/welcome/WelcomeSections";
import { getProfile, getUser } from "@/lib/auth";
import { getInternshipCount } from "@/lib/internship-count";
import { startups } from "@/lib/site-data";

// Enter goes straight to the side picker — no email step first. The account is
// created after an application is sent, not before one is started. Signed-in
// users with a side already picked go to their HQ.
export default async function WelcomePage() {
  const [user, profile, internshipCount] = await Promise.all([
    getUser(),
    getProfile(),
    getInternshipCount(),
  ]);

  const ctaHref = !profile?.role
    ? "/onboarding"
    : profile.role === "startup"
      ? "/startup/home"
      : "/home";

  return (
    <>
      <GradientHero
        signedIn={Boolean(user)}
        ctaHref={ctaHref}
        placements={startups.length}
      />
      <WelcomeSections internshipCount={internshipCount} />
      {/* The scroll-scrubbed rocket: fixed, transparent, never takes a click.
          Its flight path is anchored to the sections above (data-rocket). */}
      <RocketLayer />
    </>
  );
}
