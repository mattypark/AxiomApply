import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Newsreader } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { LenisProvider } from "@/components/motion/LenisProvider";
import "./globals.css";
import "./scroll-sections.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

/**
 * Display serif.
 *
 * Anthropic's own faces (Styrene, Copernicus) are licensed and cannot be
 * redistributed, so this is the closest free stand-in: a warm high-contrast
 * transitional serif with the same editorial weight. Display sizes only —
 * Inter still carries every piece of running text.
 */
const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
  display: "swap",
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
});

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
  icons: { icon: "/axiom-mark.png" },
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
      className={`${inter.variable} ${jetbrains.variable} ${newsreader.variable}`}
    >
      <head>
      </head>
      <body>
        {/* AmbientBackdrop + ShapeField (the dot field) removed site-wide —
            every page is now the same flat white as the welcome screen. */}
        <LenisProvider>{children}</LenisProvider>
        <Analytics />
      </body>
    </html>
  );
}
