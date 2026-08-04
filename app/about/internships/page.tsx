import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata = {
  title: "Internships",
  description:
    "How internships at Axiom Pathways work — where the listings come from, who reads your application, and what a placement actually looks like.",
};

/**
 * The public explainer, not the product.
 *
 * `/internships` is the live feed inside the workspace. This page is what the
 * footer points at: a signed-out visitor reading about how the thing works
 * before deciding to hand over an email address. Same shell as /privacy so it
 * reads as a document rather than an app screen.
 */
const sections: LegalSection[] = [
  {
    heading: "What this is",
    body: [
      "Axiom Pathways places high school and early-college students into real work at early-stage startups. Not shadowing, not a certificate, not a summer program you pay for. A role at a company, with something to ship.",
      "Everything here is free. It has always been free, and there is no version of this that costs a student money.",
    ],
  },
  {
    heading: "Two ways in",
    body: [
      "The first is the open feed. We pull internship listings from public sources every day and put them in one place, sorted by season and field. No account needed, no gate, nothing asked of you. If all you want is a better list than the one you are scrolling now, take it and go.",
      "The second is the network. You apply once, a person reads it, and if there is a startup in the network that fits, we introduce you. That path is the reason Axiom exists.",
    ],
  },
  {
    heading: "How the application works",
    body: [
      "One application, three steps, saved as you type. It asks what you have built, what you want to work on, and where to reach you.",
      "A person reads every one. Not a filter, not a keyword scan — one of the two founders. You hear back within fourteen days either way, including when the answer is no.",
    ],
    list: [
      "No GPA cutoff. We have never asked for a transcript and do not plan to.",
      "No essay-writing contest. Links to things you made beat adjectives about yourself.",
      "No fee, at any stage.",
      "If you are under 18, a parent or guardian signs off before any placement starts.",
    ],
  },
  {
    heading: "What a placement looks like",
    body: [
      "Startups tell us what they need before they ever see a candidate: the specific role, the hours, whether it pays, and what a new intern would ship in their first week. Vague requests get sent back.",
      "We put two to four people in front of a role, matched by hand. The intro email names the startup, the role, and who you report to. From there it is a normal working relationship — you are on their team, not ours.",
    ],
  },
  {
    heading: "Who this is for",
    body: [
      "Students who have made something and want somewhere to point it. That is the whole filter. The strongest applications we get are from people with a GitHub, a shipped side project, a store, a channel, an event they ran — evidence they finish things.",
      "If you have not built anything yet, start the Learn track first and apply after. That is not a rejection, it is an order of operations.",
    ],
  },
  {
    heading: "Questions",
    body: [
      "Email us. A person reads that too.",
    ],
  },
];

export default function InternshipsAboutPage() {
  return (
    <LegalDoc
      title="Internships"
      updated="August 3, 2026"
      intro="Where the listings come from, who reads your application, and what a placement actually looks like."
      sections={sections}
    />
  );
}
