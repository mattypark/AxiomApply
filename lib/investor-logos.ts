/**
 * Investor and accelerator marks the site shows as decoration — the journey
 * loop's Intern stop and the rocket's click burst draw from here, at random.
 *
 * The files are the firms' own logos as transparent SVGs, from Wikimedia
 * Commons (fetched 2026-09-28, at Matthew's request). They are trademarks of
 * their owners and appear as "the kind of places this leads", not as backers
 * of Axiom. Adding one: drop the SVG in public/logos/investors/ and add a line.
 */

export type InvestorLogo = {
  name: string;
  href: string;
  /** Width over height, from the SVG's viewBox. */
  aspect: number;
};

export const INVESTOR_LOGOS: InvestorLogo[] = [
  { name: "Y Combinator", href: "/logos/investors/ycombinator.svg", aspect: 1 },
  { name: "Andreessen Horowitz", href: "/logos/investors/a16z.svg", aspect: 4.36 },
  { name: "Sequoia", href: "/logos/investors/sequoia.svg", aspect: 7.6 },
  { name: "Accel", href: "/logos/investors/accel.svg", aspect: 3.12 },
  { name: "Kleiner Perkins", href: "/logos/investors/kleiner-perkins.svg", aspect: 9.52 },
  { name: "Founders Fund", href: "/logos/investors/founders-fund.svg", aspect: 9.57 },
  { name: "Lightspeed", href: "/logos/investors/lightspeed.svg", aspect: 4.93 },
  { name: "General Catalyst", href: "/logos/investors/general-catalyst.svg", aspect: 6.9 },
  { name: "Greylock", href: "/logos/investors/greylock.svg", aspect: 3.83 },
];

let last = -1;

/** A random mark, never the same one twice in a row. */
export function randomInvestor(): InvestorLogo {
  let index = Math.floor(Math.random() * INVESTOR_LOGOS.length);
  if (INVESTOR_LOGOS.length > 1 && index === last) index = (index + 1) % INVESTOR_LOGOS.length;
  last = index;
  return INVESTOR_LOGOS[index];
}

/** Fit a mark inside a box, keeping its shape. */
export function fitLogo(logo: InvestorLogo, maxWidth: number, maxHeight: number) {
  const width = Math.min(maxWidth, logo.aspect * maxHeight);
  return { width, height: width / logo.aspect };
}
