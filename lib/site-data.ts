/**
 * Shared site content carried over from the Astro build.
 * Single source for startup network, founders, and socials.
 */

export const startups = [
  { name: "FinalDose", yc: "YC P26", meta: "Biotech / Medicine · cohort opens summer" },
  { name: "Stealth", yc: "YC S26", meta: "Hardware · taking interns" },
  { name: "Anvara", yc: null, meta: "Sponsorships / Marketplace · taking interns" },
  { name: "Tally", yc: null, meta: "Consumer / Social · taking interns" },
  { name: "Quarter Life Crisis", yc: null, meta: "Brand / Lifestyle · taking interns" },
  { name: "Topit AI", yc: null, meta: "AI / Consumer · taking interns" },
  { name: "TypeOS", yc: "YC X25", meta: "AI / Productivity · taking interns" },
  { name: "Corgi", yc: "YC S24", meta: "Go-to-market · Series B, looking for GTM interns" },
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
