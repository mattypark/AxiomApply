import { ProblemSection } from "@/components/sections/ProblemSection";
import { WhatYouGetSection } from "@/components/sections/WhatYouGetSection";
import { CountBanner } from "@/components/sections/CountBanner";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { StartupsSection } from "@/components/sections/StartupsSection";
import { InsideTheWorkSection } from "@/components/sections/InsideTheWorkSection";
import { QuestionsSection } from "@/components/sections/QuestionsSection";
import { ClosingCta } from "@/components/sections/ClosingCta";
import { SiteFooter } from "@/components/welcome/scroll/SiteFooter";

/**
 * Everything below the hero, in the order it is read.
 *
 * Six numbered beats and a close: the problem, what you get, the size of the
 * feed, the mechanics, who is on the other end, what the work looks like, and
 * the questions people actually ask. The numbers are what make it feel indexed
 * rather than listed, so they run 01–06 unbroken — the feed band and the
 * closing plane sit between them without taking one.
 *
 * The previous stack (what / feature / how / faq / discord) lived on a second
 * stylesheet copied from an unrelated reference, with its own ink, its own
 * type scale and a @keyframes marquee that overrode this project's. Both are
 * gone; these sections are Tailwind against the tokens in globals.css.
 */
export function WelcomeSections({ internshipCount }: { internshipCount: number }) {
  return (
    <div className="relative">
      <ProblemSection />
      <WhatYouGetSection />
      <CountBanner count={internshipCount} />
      <HowItWorksSection />
      <StartupsSection />
      <InsideTheWorkSection />
      <QuestionsSection />
      <ClosingCta />
      <SiteFooter />
    </div>
  );
}
