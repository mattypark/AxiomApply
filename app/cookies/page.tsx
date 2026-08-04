import { LegalDoc, type LegalSection } from "@/components/legal/LegalDoc";

export const metadata = {
  title: "Cookie Policy",
  description:
    "The cookies Axiom Pathways sets, what each one does, and how to turn off the ones that aren't essential.",
};

const sections: LegalSection[] = [
  {
    heading: "What a cookie actually is",
    body: [
      "A cookie is a small text file a website stores in your browser. It usually holds a short ID, not your personal information. Its job is to let the site recognise your browser on the next page load — otherwise you would be signed out every time you clicked a link.",
      "Some are essential to the site working. Others are optional. Below is every one we use and which kind it is.",
    ],
  },
  {
    heading: "Essential — always on",
    body: [
      "These make the site function. They cannot be switched off, because without them you could not sign in or stay signed in.",
    ],
    list: [
      "Session cookies (set by Supabase, our auth provider) — keep you signed in as you move between pages. Cleared when you sign out.",
      "Security cookies — protect sign-in and forms against request forgery.",
      "Your cookie choice itself — so we stop asking once you have answered.",
    ],
  },
  {
    heading: "Analytics — optional",
    body: [
      "We use Vercel Analytics to count page views and see which pages get used. It does not use cookies to follow you across other websites, and it does not build a profile of you.",
      "If you choose Essential only, this is what gets switched off.",
    ],
  },
  {
    heading: "What we do not use",
    body: [
      "No advertising cookies. No third-party tracking pixels. No cross-site profiling, and no selling or sharing your browsing to anyone.",
      "This matters more than usual here: most of the people using Axiom are minors. Several state privacy laws restrict targeted advertising to known minors, and we do not run any.",
    ],
  },
  {
    heading: "Your choices",
    body: [
      "The banner on your first visit lets you pick Accept all or Essential only. Your choice is stored locally, and we do not ask again unless you clear your browser data.",
      "You can also clear or block cookies in your browser settings at any time. Blocking essential cookies means sign-in will stop working — everything you can browse without an account will still work fine.",
    ],
  },
  {
    heading: "Changes and contact",
    body: [
      "If we add anything that sets a new cookie, this page gets updated and the date at the top changes.",
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <LegalDoc
      title="Cookie Policy"
      updated="August 3, 2026"
      intro="Every cookie this site sets, what it does, and which ones you can turn off. Short, because there aren't many."
      sections={sections}
    />
  );
}
