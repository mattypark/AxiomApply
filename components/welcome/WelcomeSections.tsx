import { WhatSection } from "@/components/welcome/scroll/WhatSection";
import { FeatureSection } from "@/components/welcome/scroll/FeatureSection";
import { HowSection } from "@/components/welcome/scroll/HowSection";
import { StepsSection } from "@/components/welcome/scroll/StepsSection";
import { FaqSection } from "@/components/welcome/scroll/FaqSection";
import { SiteFooter } from "@/components/welcome/scroll/SiteFooter";
import { ScrollMotion } from "@/components/welcome/scroll/ScrollMotion";

/**
 * Everything below the hero.
 *
 * An editorial long-scroll: oversized statements, ruled splits, cross-fading
 * image grids and a pinned 3D slide stack. Imagery is placeholder for now, at
 * the intrinsic sizes the real assets will use so nothing reflows when they
 * land.
 *
 * Styles live in app/scroll-sections.css, imported by the root layout. ScrollMotion
 * wires the flash-in headlines, the cross-fading grids, the marquee fade and
 * the pinned 3D slide stack; the FAQ accordion and the footer dot field own
 * their own behaviour.
 */
export function WelcomeSections() {
  return (
    <div className="fx-scroll relative z-10">
      <WhatSection />
      <FeatureSection />
      <HowSection />
      <StepsSection />
      <FaqSection />
      <SiteFooter />

      <ScrollMotion />
    </div>
  );
}
