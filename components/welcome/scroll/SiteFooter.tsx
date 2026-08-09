import Link from "next/link";
import { DotsField } from "@/components/welcome/scroll/DotsField";
import { einLine } from "@/lib/org";

/**
 * Section 11 — the footer.
 *
 * Brand block top-left, two
 * link columns right, legal row underneath, and the interactive dot field
 * filling the base. The glyph is the Axiom mark
 * and wordmark; links point at real routes.
 */

/**
 * Footer links go to PUBLIC pages, never straight into the workspace.
 *
 * `/internships` and `/learn` are signed-in product surfaces; dropping a
 * signed-out visitor into one from the marketing footer skips the part where
 * they decide whether they want an account. These point at the explainers
 * instead, same document shell as /privacy — read first, sign up after.
 */
const PRODUCT_LINKS = [
  { label: "Internships", href: "/about/internships" },
  { label: "Learn", href: "/about/learn" },
] as const;

const AUDIENCE_LINKS = [
  { label: "For startups", href: "/for-startups" },
  { label: "Get started", href: "/onboarding" },
] as const;

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
] as const;

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://www.instagram.com/axiompathways/" },
  { label: "LinkedIn", href: "https://www.linkedin.com/company/axiom-pathways/" },
  { label: "Contact", href: "/contact" },
] as const;

export function SiteFooter() {
  return (
    <section className="footer">
      <div className="footer__wrap">
        <div className="footer__main">
          <Link href="/" className="footer__logo">
            <img
              src="/axiom-mark.png"
              alt=""
              width={36}
              height={36}
              className="footer__logo-mark"
            />
            <span className="footer__logo-txt">Axiom Pathways</span>
          </Link>

          <div className="footer__main__wrap">
            <div className="footer__main__top">
              <div className="footer__main__left">
                <div className="footer__main__list">
                  {PRODUCT_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="footer__main__link u-title-1 u-fonts-100"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="footer__main__list">
                  {LEGAL_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="footer__main__link-small u-title-2 u-fonts-50"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="footer__main__right">
                <div className="footer__main__list">
                  {AUDIENCE_LINKS.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      className="footer__main__link u-title-1 u-fonts-100"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
                <div className="footer__main__list">
                  {SOCIAL_LINKS.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.href.startsWith("http") ? "_blank" : undefined}
                      rel={
                        link.href.startsWith("http")
                          ? "noopener noreferrer"
                          : undefined
                      }
                      className="footer__main__link-small u-title-2 u-fonts-50"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="footer__main__bottom">
          <p className="footer__main__txt u-title-2 u-fonts-50">
            © 2026, Axiom Pathways. All rights reserved.
            {einLine() ? ` · ${einLine()}` : ""}
          </p>
          <p className="footer__main__txt u-title-2 u-fonts-50">
            A nonprofit placing students into real startup work.
          </p>
        </div>

        <DotsField />
      </div>
    </section>
  );
}
