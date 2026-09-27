import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { LenisProvider } from "@/components/motion/LenisProvider";
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
    title: "Axiom Pathways — Connecting young talent to their passions",
    description:
      "A nonprofit placing high school and early-college students into real startup work. Selected for what they have shipped, not their credentials.",
    url: "https://axiomapply.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "Axiom Pathways — Connecting young talent to their passions",
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
      className={`${dmSans.variable} ${instrumentSerif.variable} ${jetbrains.variable}`}
    >
      <head />
      <body>
        {/* AmbientBackdrop + ShapeField (the dot field) removed site-wide —
            every page is now the same flat white as the welcome screen. */}
        <LenisProvider>{children}</LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
