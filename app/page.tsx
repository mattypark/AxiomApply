import { GradientHero } from "@/components/hero/GradientHero";
import { RocketLayer } from "@/components/rocket/RocketLayer";
import { StorySection } from "@/components/story/StorySection";
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
      {/* Six chapters beside a pinned 3D stage on desktop; plain text below. */}
      <StorySection />
      <WelcomeSections internshipCount={internshipCount} />
      {/* The particle object: morphs through the story's chapters, lifts
          off, and lands on the pad in the closing band. Desktop only. */}
      <RocketLayer />
    </>
  );
}
