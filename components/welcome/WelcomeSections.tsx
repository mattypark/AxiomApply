import { CountBanner } from "@/components/sections/CountBanner";
import { HowItWorksSection } from "@/components/sections/HowItWorksSection";
import { StartupsSection } from "@/components/sections/StartupsSection";
import { QuestionsSection } from "@/components/sections/QuestionsSection";
import { SiteFooter } from "@/components/welcome/scroll/SiteFooter";

/**
 * Everything below the story, in the order it is read.
 *
 * The story section above (components/story) now carries the argument — the
 * pile, being seen, the intro, the work — so what follows is the concrete
 * part: the size of the feed, the mechanics, who is on the other end, and the
 * questions people actually ask. The numbered beats run 01–03 unbroken; the
 * feed band sits between them without taking a number.
 */
export function WelcomeSections({ internshipCount }: { internshipCount: number }) {
  return (
    <div className="relative">
      <CountBanner count={internshipCount} />
      <HowItWorksSection />
      <StartupsSection />
      <QuestionsSection />
      <SiteFooter />
    </div>
  );
}
