/**
 * Investor and accelerator marks the site may show as decoration — the
 * journey loop's Intern stop and the rocket's click burst draw from here.
 *
 * Only marks with a true connection belong in this list: startups in the
 * network are YC companies (lib/site-data.ts). Adding another firm (a16z, …)
 * is Matthew's call — it reads as that firm backing Axiom — and needs its
 * logo file in public/logos/ plus one line here.
 */

export type InvestorLogo = {
  name: string;
  href: string;
  /** Pixel size of the file, for aspect ratio. */
  width: number;
  height: number;
};

export const INVESTOR_LOGOS: InvestorLogo[] = [
  { name: "Y Combinator", href: "/logos/ycombinator.png", width: 320, height: 91 },
];

export function randomInvestor(): InvestorLogo {
  return INVESTOR_LOGOS[Math.floor(Math.random() * INVESTOR_LOGOS.length)];
}
