import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata = {
  title: "Privacy Policy",
  description:
    "What Axiom Pathways collects, why we collect it, who we share it with, and how to get it deleted.",
};

const sections: LegalSection[] = [
  {
    heading: "Who we are",
    body: [
      "Axiom Pathways connects students with internships at early-stage startups. This policy covers axiomapply.com and everything you do while signed in to it.",
      "Plain version: we collect what we need to match you with a startup, and nothing we do not need. We do not sell your data.",
    ],
  },
  {
    heading: "What we collect",
    body: ["When you create an account and use the site, we store:"],
    list: [
      "Account: your email address, and your name if you sign in with Google.",
      "Profile: school, grade, the seasons and fields you are interested in, a short description of what you are looking for, and any GitHub, LinkedIn, or social links you choose to add. Every one of these is optional except your email.",
      "Activity: which internships you save, and which Learn modules you open.",
      "Applications: whatever you submit through the application form, including your responses and any files you attach.",
      "Startup accounts: company name, contact details, and what kind of intern you are looking for.",
      "Technical: standard server logs and privacy-friendly page analytics. We do not use advertising trackers.",
    ],
  },
  {
    heading: "Why we collect it",
    body: [
      "To run your account and keep you signed in. To show you internships that match what you told us you want. To review your application and introduce you to startups in the network. To email you about your application and about Axiom.",
      "We do not use your data to train models, and we do not build advertising profiles.",
    ],
  },
  {
    heading: "Who we share it with",
    body: [
      "We share data with the services that run the product, and with startups when you apply. Nobody else.",
    ],
    list: [
      "Supabase — database and authentication.",
      "Vercel — hosting and page analytics.",
      "Resend — sending email.",
      "Google — only if you choose to sign in with Google.",
      "Startups in the network — when you apply or ask to be matched, we share the relevant parts of your application with the startups being considered. We do not hand your profile to a startup you have not applied to.",
    ],
  },
  {
    heading: "If you are under 18",
    body: [
      "Axiom Pathways is built for high school and early college students, so most of the people using it are minors. We take that seriously.",
      "You must be at least 13 to create an account. We do not knowingly collect information from anyone under 13. If we learn we have, we delete it.",
      "If you are under 18, talk to a parent or guardian before applying, and before accepting any position. A parent or guardian can email us at any time to see what we hold about you or to have it deleted.",
    ],
  },
  {
    heading: "Email",
    body: [
      "If you have an account, we will email you about your application status and occasional updates about Axiom. Every non-essential email has an unsubscribe link, and unsubscribing never affects your application.",
      "Account and security emails — sign-in, password, application decisions — are part of the service and are not marketing.",
    ],
  },
  {
    heading: "Your choices",
    body: ["You control your data. You can:"],
    list: [
      "Edit or clear most of your profile yourself from the Account page.",
      "Ask us for a copy of everything we hold about you.",
      "Ask us to delete your account and your data.",
      "Unsubscribe from non-essential email.",
    ],
  },
  {
    heading: "How long we keep it",
    body: [
      "We keep your account data while your account is open. If you ask us to delete it, we remove it within 30 days, except where we are legally required to keep a record.",
      "Applications are kept so we can match you across future seasons rather than making you start over. Ask us and we will delete them.",
    ],
  },
  {
    heading: "Security",
    body: [
      "Data is encrypted in transit and at rest, and access to the database is limited to the people who run Axiom. No system is perfect. If a breach affects you, we will tell you.",
    ],
  },
  {
    heading: "Changes",
    body: [
      "If we change this policy in a way that matters, we will update the date at the top and email account holders. Continuing to use the site after a change means you accept it.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy Policy"
      updated="August 3, 2026"
      intro="What we collect, why we collect it, who sees it, and how to get it deleted. Written to be read, not to be skipped."
      sections={sections}
    />
  );
}
