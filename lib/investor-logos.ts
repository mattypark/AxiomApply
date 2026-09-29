/**
 * Investor and accelerator marks the site shows as decoration — the journey
 * loop's Intern stop and the rocket's click burst draw from here, at random.
 *
 * Each firm shows as its mark alone, not its full name: the symbol cropped
 * out of its own logo (Wikimedia Commons SVGs, fetched 2026-09-28 at
 * Matthew's request) — YC's Y, Sequoia's tree, KP's diamond, Founders Fund's
 * stripes, Lightspeed's L, General Catalyst's G. Where the brand is only a
 * name (Accel, Greylock) it stays the name; a16z's site has no short mark
 * any more, so it is set as the name "a16z". They are trademarks of
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
  { name: "Andreessen Horowitz", href: "/logos/investors/a16z-name.svg", aspect: 3 },
  { name: "Sequoia", href: "/logos/investors/sequoia-mark.svg", aspect: 1 },
  { name: "Accel", href: "/logos/investors/accel.svg", aspect: 3.12 },
  { name: "Kleiner Perkins", href: "/logos/investors/kleiner-perkins-mark.svg", aspect: 1 },
  { name: "Founders Fund", href: "/logos/investors/founders-fund-mark.svg", aspect: 1 },
  { name: "Lightspeed", href: "/logos/investors/lightspeed-mark.svg", aspect: 1 },
  { name: "General Catalyst", href: "/logos/investors/general-catalyst-mark.svg", aspect: 1.03 },
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
