import Image from "next/image";
import Link from "next/link";
import { HomeFooter } from "@/components/home/HomeFooter";
import { einLine, ORG_LEGAL_NAME } from "@/lib/org";

export type LegalSection = {
  heading: string;
  /** Each string renders as its own paragraph. */
  body: string[];
  /** Optional bulleted list rendered after the paragraphs. */
  list?: string[];
};

type Props = {
  title: string;
  /** Human-readable date, e.g. "August 3, 2026". */
  updated: string;
  intro: string;
  sections: LegalSection[];
};

/** Both founders, so a question never waits on one inbox. */
const CONTACT = ["matthew@axiompathways.org", "frank@axiompathways.org"] as const;

/** "Who we are" → "who-we-are", for the contents links. */
function anchor(heading: string) {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Privacy, Terms, Cookies and the About pages, in the home page's system:
 * the path-coloured ground under a big display title, then the document on
 * white, numbered, at a reading measure, with the contents pinned beside it
 * on wide screens. The documents themselves stay plain data in each page, so
 * the words can change without touching this layout.
 */
export function LegalDoc({ title, updated, intro, sections }: Props) {
  return (
    <div className="ms bg-white">
      <div className="ms-ground">
        <header className="mx-auto flex h-16 w-full max-w-[90rem] items-center justify-between px-5 sm:h-20 sm:px-[6.5%]">
          <Link href="/" className="flex items-center gap-2" aria-label="Axiom home">
            <Image src="/axiom-mark-256.png" alt="" width={256} height={256} className="h-8 w-8 object-contain" />
            <span className="text-[22px] font-semibold tracking-[-0.04em] text-ms-ink">axiom</span>
          </Link>
          <Link href="/onboarding" className="ms-pill h-11 px-6 text-[15px]">
            Apply
          </Link>
        </header>

        <div className="mx-auto w-full max-w-[90rem] px-5 pt-10 pb-14 sm:px-[6.5%] sm:pt-16 sm:pb-20">
          <p className="text-[14px] font-medium text-ms-body sm:text-[16px]">
            Axiom Pathways · Last updated {updated}
          </p>
          <h1 className="ms-display mt-3 text-[clamp(2.6rem,8vw,6rem)] text-ms-ink">{title}</h1>
          <p className="mt-5 max-w-[46ch] text-[17px] leading-relaxed text-ms-body sm:text-[20px]">{intro}</p>
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[90rem] gap-10 px-5 py-12 sm:px-[6.5%] sm:py-20 lg:grid-cols-[16rem_1fr] lg:gap-20">
        <nav aria-label="Contents" className="hidden lg:block">
          <div className="sticky top-10">
            <p className="text-[13px] font-medium text-ms-muted">Contents</p>
            <ol className="mt-4 flex flex-col gap-2.5 text-[15px]">
              {sections.map((section, i) => (
                <li key={section.heading}>
                  <a
                    href={`#${anchor(section.heading)}`}
                    className="flex gap-3 text-ms-body transition-colors hover:text-ms-ink"
                  >
                    <span className="w-5 shrink-0 text-ms-green tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                    {section.heading}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <div className="min-w-0">
          {sections.map((section, i) => (
            <section
              key={section.heading}
              id={anchor(section.heading)}
              className="scroll-mt-10 border-t border-ms-ink/10 py-8 first:border-t-0 first:pt-0 sm:py-10"
            >
              <p className="text-[13px] font-medium text-ms-green tabular-nums">{String(i + 1).padStart(2, "0")}</p>
              <h2 className="mt-2 text-[22px] font-medium tracking-[-0.03em] text-ms-ink sm:text-[28px]">
                {section.heading}
              </h2>
              <div className="mt-4 flex max-w-[64ch] flex-col gap-3.5">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-[15.5px] leading-[1.65] text-ms-body sm:text-[17px]">
                    {paragraph}
                  </p>
                ))}
                {section.list ? (
                  <ul className="flex flex-col gap-2.5">
                    {section.list.map((item) => (
                      <li
                        key={item.slice(0, 40)}
                        className="relative pl-6 text-[15.5px] leading-[1.65] text-ms-body sm:text-[17px]"
                      >
                        <span aria-hidden="true" className="absolute top-[0.8em] left-0 h-1.5 w-1.5 rounded-full bg-ms-green" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}

          <aside className="mt-4 rounded-[28px] bg-ms-sky-soft p-6 sm:mt-8 sm:p-8">
            <p className="text-[20px] font-medium tracking-[-0.03em] text-ms-ink sm:text-[24px]">Questions about this?</p>
            <p className="mt-2 text-[15.5px] leading-relaxed text-ms-body sm:text-[17px]">
              Email us and a person answers:{" "}
              {CONTACT.map((email, i) => (
                <span key={email}>
                  {i > 0 ? " or " : ""}
                  <a href={`mailto:${email}`} className="font-medium text-ms-ink underline underline-offset-4 hover:opacity-70">
                    {email}
                  </a>
                </span>
              ))}
              .
            </p>
            {/* Legal documents should say which legal entity is making the promises. */}
            <p className="mt-5 text-[13px] text-ms-muted">
              {ORG_LEGAL_NAME}
              {einLine() ? ` · ${einLine()}` : ""}
            </p>
          </aside>
        </div>
      </main>

      <HomeFooter />
    </div>
  );
}
