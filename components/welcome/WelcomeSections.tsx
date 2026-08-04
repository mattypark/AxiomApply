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
 * Ported from ~/Downloads/current-projects/fourmula-clone — a 1:1 rebuild of
 * fourmula.ai. The grid, spacing, type scale and every animation timing are
 * that build's; the copy is Axiom's and the imagery is the clone's placeholder
 * set (identical intrinsic sizes, so real assets drop in without reflow).
 *
 * Styles live in app/fourmula.css, imported by the root layout. ScrollMotion
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
