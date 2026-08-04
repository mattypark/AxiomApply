import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata = {
  title: "Terms of Service",
  description:
    "The rules for using Axiom Pathways — eligibility, accounts, what we promise, and what we do not.",
};

const sections: LegalSection[] = [
  {
    heading: "The agreement",
    body: [
      "Using axiomapply.com means you agree to these terms. If you do not agree, do not use the site. Everything here applies to interns and to startups.",
    ],
  },
  {
    heading: "Who can use Axiom",
    body: [
      "You must be at least 13 to create an account. If you are under 18, you need a parent or guardian's permission to use Axiom and to accept any position we introduce you to.",
      "One account per person. Give us accurate information — an application built on things that are not true wastes a startup's time and yours.",
    ],
  },
  {
    heading: "Your account",
    body: [
      "You are responsible for your account and for keeping your password private. Tell us if you think someone else has access to it.",
      "You can delete your account at any time. We can suspend or close an account that breaks these terms.",
    ],
  },
  {
    heading: "What Axiom does",
    body: [
      "We list internship opportunities, teach a curriculum, and introduce students to startups in our network.",
      "We are an introduction, not an employer. Axiom does not employ you, does not set your pay, hours, or duties, and is not a party to any agreement you sign with a startup. That relationship is between you and them.",
    ],
  },
  {
    heading: "What we do not promise",
    body: [
      "Applying does not guarantee a placement. Being placed does not guarantee the role works out. We select on effort and obsession rather than credentials, and we still cannot promise an outcome.",
      "The internship feed is pulled automatically from public sources and refreshed daily. Listings can be stale, closed, or wrong. Always confirm details on the employer's own posting before applying.",
      "We do not screen or endorse the startups in the feed. Do your own diligence before accepting anything, and never pay to get a job.",
    ],
  },
  {
    heading: "Rules",
    body: ["Do not:"],
    list: [
      "Misrepresent who you are, what you have built, or who you work for.",
      "Apply on someone else's behalf, or create accounts for other people.",
      "Scrape, resell, or republish the internship feed.",
      "Attempt to access accounts, data, or admin functions that are not yours.",
      "Upload anything unlawful, malicious, or that you do not have the right to share.",
      "Use Axiom to recruit for anything that is not a genuine opportunity.",
    ],
  },
  {
    heading: "Startups",
    body: [
      "Startup accounts are reviewed by hand before they get access. We can decline or revoke access for any reason.",
      "If you are approved, you may use candidate information only to evaluate that candidate for the role they applied to. Do not resell it, add it to a mailing list, or pass it on. Roles you post must be real, and you must follow the employment and labor laws that apply to you — including the ones covering minors.",
    ],
  },
  {
    heading: "Your content",
    body: [
      "What you submit stays yours. You give us permission to store it and to show the relevant parts to startups you apply to, so we can run the matching process. Nothing more.",
    ],
  },
  {
    heading: "Liability",
    body: [
      "The site is provided as-is. To the extent the law allows, Axiom Pathways is not liable for indirect or consequential damages, or for anything that happens between you and a startup.",
      "Nothing here limits liability that cannot legally be limited.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "We may update these terms. Material changes get a new date at the top and an email to account holders. Continuing to use the site after a change means you accept it.",
    ],
  },
];

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of Service"
      updated="August 3, 2026"
      intro="The rules for using Axiom Pathways. Short, in plain words, and worth reading before you apply."
      sections={sections}
    />
  );
}
