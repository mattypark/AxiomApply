import type { Metadata } from "next";
import { DM_Sans, Hanken_Grotesk, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics/SiteAnalytics";
import { LenisProvider } from "@/components/motion/LenisProvider";
import { PageTransition } from "@/components/transition/PageTransition";
import { PATH_BOOT } from "@/lib/path-boot";
import "./globals.css";

/**
 * The pair klinn.works is set in, which the landing, sign-in and onboarding
 * copy one-to-one (see docs/DESIGN-REFS.md). DM Sans carries every piece of
 * running text and UI; Instrument Serif is display only, with its italic for
 * the one emphasised word in a headline.
 */
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
  weight: "400",
  style: ["normal", "italic"],
});

/**
 * The home page's face — Moonshot's (moonshot.computer), which the home copies.
 * Scoped to `.ms` in globals.css; the rest of the site keeps DM Sans.
 */
const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
  weight: ["400", "500", "600"],
});

/** Mono stays for the app's data layer (chips, timestamps). The landing uses none. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://axiomapply.com"),
  title: {
    default: "Axiom Pathways — Drop into a real startup",
    template: "%s — Axiom Pathways",
  },
  description:
    "Axiom Pathways drops high school and college students straight into real startups — building what ships, picked for passion, not credentials.",
  // The favicon is app/icon.png — file-based, fingerprinted, 1KB. The old
  // explicit entry pointed at the 1024px source and shipped 1.29MB on
  // every page load, favicon included.
  // Declared explicitly so a scraper never has to guess. Left to its own
  // devices iMessage picked the largest image on the welcome page, which was a
  // founder's photo out of the orbiting ring — the card is the mark and the
  // why, and app/opengraph-image.tsx draws it.
  openGraph: {
    type: "website",
    siteName: "Axiom Pathways",
    title: "Axiom Pathways — Find your passion at Axiom",
    description:
      "A nonprofit placing high school and early-college students into real startup work. Selected for what they have shipped, not their credentials.",
    url: "https://axiomapply.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom Pathways — Find your passion at Axiom",
    description:
      "A nonprofit placing high school and early-college students into real startup work.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="light"
      // PATH_BOOT sets data-path before hydration, so React must not object.
      suppressHydrationWarning
      className={`${dmSans.variable} ${instrumentSerif.variable} ${hanken.variable} ${jetbrains.variable}`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: PATH_BOOT }} />
      </head>
      <body>
        {/* AmbientBackdrop + ShapeField (the dot field) removed site-wide —
            every page is now the same flat white as the welcome screen. */}
        <LenisProvider>
          <PageTransition>{children}</PageTransition>
        </LenisProvider>
        <SiteAnalytics />
      </body>
    </html>
  );
}
