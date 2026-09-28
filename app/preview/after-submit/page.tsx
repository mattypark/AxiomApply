import type { Metadata } from "next";
import Link from "next/link";
import { PreviewFrame } from "@/components/preview/PreviewFrame";
import { MOCK_HQ_CODE } from "@/components/preview/hq/secret";

// The prototype's contents page. Nothing on the live site links here.
export const metadata: Metadata = {
  title: "After-submit prototype",
  robots: { index: false, follow: false },
};

const SCREENS = [
  { href: "/preview/hq", title: "HQ", line: "Every application, live — numbers, charts, the list, the detail drawer." },
  { href: `/preview/hq/${MOCK_HQ_CODE}`, title: "HQ at its secret path", line: "The unguessable-URL pattern. Any other code is a plain 404." },
  { href: "/preview/after-submit/home", title: "Applicant home", line: "Where it stands, what's next, the mail we've sent." },
  { href: "/preview/after-submit/application", title: "Your application", line: "What they sent, and what they can still change." },
];

export default function AfterSubmitIndex() {
  return (
    <PreviewFrame current="index">
      <main className="mx-auto w-full max-w-[90rem] px-4 pt-6 pb-28 sm:px-[6.5%] sm:pt-12">
        <h1 className="ms-display ms-rise text-[clamp(3rem,6vw,5.6rem)] text-ms-ink">
          After you
          <br />
          apply
        </h1>
        <p className="mt-5 max-w-[32rem] text-[19px] text-ms-body">
          A clickable prototype. Everything is made up. Use &ldquo;View as…&rdquo; on each screen to switch path, status and state.
        </p>
        <ul className="mt-10 grid gap-3 lg:grid-cols-2">
          {SCREENS.map((screen) => (
            <li key={screen.href}>
              <Link
                href={screen.href}
                className="group flex h-full items-center justify-between gap-6 rounded-[28px] bg-white p-6 transition-transform duration-300 ease-ms hover:-translate-y-0.5 motion-reduce:transition-none sm:p-8"
              >
                <span>
                  <span className="block text-[24px] font-medium tracking-[-0.03em] text-ms-ink">{screen.title}</span>
                  <span className="mt-1 block text-[15px] text-ms-body">{screen.line}</span>
                </span>
                <span aria-hidden="true" className="text-[24px] text-ms-ink transition-transform group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </main>
    </PreviewFrame>
  );
}
