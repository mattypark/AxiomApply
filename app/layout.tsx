import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import { LenisProvider } from "@/components/motion/LenisProvider";
import "./globals.css";
import "./fourmula.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${jetbrains.variable}`}
    >
      <head>
        {/* Applies the stored theme before first paint so the welcome screen
            never flashes light before switching to dark. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem("ax_theme");if(t)document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
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
