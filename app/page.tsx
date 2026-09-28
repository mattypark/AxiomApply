import { ApplyBlock } from "@/components/home/ApplyBlock";
import { Bento } from "@/components/home/Bento";
import { Hero } from "@/components/home/Hero";
import { HomeFaq } from "@/components/home/HomeFaq";
import { HomeFooter } from "@/components/home/HomeFooter";
import { HomeNav } from "@/components/home/HomeNav";
import { Statement } from "@/components/home/Statement";
import { CookieBanner } from "@/components/welcome/CookieBanner";
import { getProfile, getUser } from "@/lib/auth";
import { getInternshipCount } from "@/lib/internship-count";

/**
 * The home page, kept short on purpose — Moonshot's shape (moonshot.computer):
 * show the product, say what it does, a bento of the details, one way in,
 * four questions. Less scroll, less friction between arriving and applying.
 *
 * Signed-in users with a side already picked go to their home from the CTA.
 */
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
    <div className="ms">
      <HomeNav ctaHref={ctaHref} signedIn={Boolean(user)} />
      <main>
        <Hero ctaHref={ctaHref} />
        <Statement />
        <Bento internshipCount={internshipCount} />
        <ApplyBlock />
        <HomeFaq />
      </main>
      <HomeFooter />
      <CookieBanner />
    </div>
  );
}
