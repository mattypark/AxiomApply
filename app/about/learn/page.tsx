import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata = {
  title: "Learn",
  description:
    "What the Axiom Pathways Learn track covers, who it is for, and why it exists alongside the internship network.",
};

/**
 * The public explainer for Learn. `/learn` is the module list inside the
 * workspace; this is the page the footer points at, readable signed-out.
 */
const sections: LegalSection[] = [
  {
    heading: "Why this exists",
    body: [
      "Most students who want startup work are not missing ambition. They are missing the specific, unglamorous skills a small team actually needs on day one — and no class teaches those, because they change every year.",
      "Learn is the short version of what we would tell you over a call before an interview. It is free, it needs no account to browse, and it is not a course you finish for a certificate.",
    ],
  },
  {
    heading: "What it covers",
    body: [
      "Four tracks, matched to the four things startups in the network keep asking for:",
    ],
    list: [
      "AI — using models as tools you build with, not toys you prompt. What an API call costs, where the output cannot be trusted, and what a working feature looks like.",
      "Engineering — shipping something small and real end to end. Version control, reading an unfamiliar codebase, and asking a good question when you are stuck.",
      "Marketing — distribution as a skill. Writing that gets read, understanding a funnel, and measuring whether anything you did worked.",
      "Design and product — taste, hierarchy, and why a founder will notice the spacing before the feature.",
    ],
  },
  {
    heading: "How to use it",
    body: [
      "Do not treat it as a syllabus. Pick the track closest to the work you want, take one idea, and build something with it the same week. The people who get placed are the ones with a link to show, and a link only exists if you made something.",
      "Modules are short on purpose. You are a student — this has to survive a school week.",
    ],
  },
  {
    heading: "How it connects to applying",
    body: [
      "There is no requirement to finish anything before applying, and completing a track does not get you a placement. We do not score people on modules opened.",
      "What it does is give you something to point at. An application that says what you built beats one that says what you are interested in, every time.",
    ],
  },
];

export default function LearnAboutPage() {
  return (
    <LegalDoc
      title="Learn"
      updated="August 3, 2026"
      intro="What the tracks cover, who they are for, and why they sit alongside the internship network."
      sections={sections}
    />
  );
}
