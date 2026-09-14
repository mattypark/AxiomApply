/**
 * Shared site content carried over from the Astro build.
 * Single source for startup network, founders, and socials.
 */

/**
 * The network.
 *
 * `logo` is optional on purpose: four of these have a file in /public/logos and
 * the rest do not. A card with no logo draws a monogram instead, so the grid
 * stays even — and dropping a PNG into /public/logos and naming it here is the
 * only change needed to upgrade one. Inventing a wordmark for a company that
 * has not given us one is not an option.
 */
export const startups = [
  { name: "FinalDose", yc: "YC P26", meta: "Biotech / Medicine · cohort opens summer", logo: "/logos/finaldose.png" },
  { name: "Stealth", yc: "YC S26", meta: "Hardware · taking interns", logo: null },
  { name: "Anvara", yc: null, meta: "Sponsorships / Marketplace · taking interns", logo: null },
  { name: "Tally", yc: null, meta: "Consumer / Social · taking interns", logo: null },
  { name: "Quarter Life Crisis", yc: null, meta: "Brand / Lifestyle · taking interns", logo: null },
  { name: "Topit AI", yc: null, meta: "AI / Consumer · taking interns", logo: null },
  { name: "TypeOS", yc: "YC X25", meta: "AI / Productivity · taking interns", logo: "/logos/typeos.png" },
  { name: "Corgi", yc: "YC S24", meta: "Go-to-market · Series B, looking for GTM interns", logo: "/logos/corgi.png" },
] as const;

export const founders = [
  {
    name: "Matthew Park",
    role: "Co-founder",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/matthew-park-487889350/" },
      { label: "Instagram", url: "https://www.instagram.com/matty.park/" },
    ],
  },
  {
    name: "Frank Niu",
    role: "Co-founder",
    links: [
      { label: "LinkedIn", url: "https://www.linkedin.com/in/frank-niu-55054a290/" },
    ],
  },
] as const;

export const socials = [
  {
    heading: "Axiom Pathways",
    items: [
      { platform: "Instagram", handle: "@axiompathways", url: "https://www.instagram.com/axiompathways/" },
      { platform: "LinkedIn", handle: "Axiom Pathways", url: "https://www.linkedin.com/company/axiom-pathways/" },
    ],
  },
  {
    heading: "The founders",
    items: [
      { platform: "LinkedIn", handle: "Matthew Park", url: "https://www.linkedin.com/in/matthew-park-487889350/" },
      { platform: "Instagram", handle: "@matty.park", url: "https://www.instagram.com/matty.park/" },
      { platform: "LinkedIn", handle: "Frank Niu", url: "https://www.linkedin.com/in/frank-niu-55054a290/" },
    ],
  },
] as const;

export const startupSteps = [
  { n: "01", label: "You reach out" },
  { n: "02", label: "We match a builder" },
  { n: "03", label: "They drop in and ship" },
] as const;
