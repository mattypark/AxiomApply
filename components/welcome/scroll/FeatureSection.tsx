import Link from "next/link";

/**
 * Section 7 — what Axiom actually offers, as type.
 *
 * There used to be three photo grids and a looping video here. They were
 * another company's product photography and said nothing about internships,
 * so they are gone, and nothing replaced them — a number this good does not
 * need a picture beside it.
 *
 * The feed count leads at display scale, since it is the strongest single
 * fact on the page, then a ruled two-up carries the network and the learning
 * track. `data-flash` keeps the word-by-word reveal ScrollMotion drives
 * everywhere else in this stack.
 */

type Panel = {
  id: string;
  anchor: string;
  tag: string;
  title: string;
  body: string;
  href: string;
  cta: string;
};

const PANELS: Panel[] = [
  {
    id: "network",
    anchor: "anchor-products",
    tag: "The network",
    title: "Matched by hand, one at a time.",
    body: "10+ startups we place people into ourselves — FinalDose, TypeOS, Corgi, Anvara, and a few still stealth.",
    href: "/onboarding",
    cta: "Apply to the network",
  },
  {
    id: "learn",
    anchor: "anchor-video",
    tag: "Learn",
    title: "Tracks that end in something shipped.",
    body: "AI, engineering, marketing. Finish one and it shows on your file the next time you apply.",
    href: "/about/learn",
    cta: "See the tracks",
  },
];

function Tag({ label }: { label: string }) {
  return (
    <div className="feature__tag">
      <span className="feature__dot" />
      <span className="u-title-2 u-fonts-100">{label}</span>
    </div>
  );
}

export function FeatureSection() {
  return (
    <section className="feature">
      {/* The number, at the size the number deserves. */}
      <div className="feature__lead anchor-pdp" id="feed">
        <Tag label="The feed" />

        <p className="feature__count">12,597</p>

        <h3 className="feature__lead-title u-h3" data-flash>
          internships, open to everyone.
        </h3>

        <div className="feature__lead-copy">
          <p className="u-body-2 u-fonts-64">
            That&apos;s how many live listings the feed shows you — pulled
            automatically from the best trackers and lists, refreshed daily.
            They aren&apos;t ours; we just put them in one place, no gate, no
            cut.
          </p>
          <p className="u-body-2 u-fonts-50">
            Our own network is far smaller and matched by hand — we&apos;re a
            nonprofit, and it grows as fast as two people can grow it.
          </p>
          <Link href="/internships" className="feature__link u-body-2">
            Open the feed →
          </Link>
        </div>
      </div>

      <div className="feature__split">
        {PANELS.map((panel) => (
          <div
            key={panel.id}
            className={`feature__panel ${panel.anchor}`}
            id={panel.id}
          >
            <Tag label={panel.tag} />
            <h3 className="feature__panel-title u-h3" data-flash>
              {panel.title}
            </h3>
            <p className="u-body-2 u-fonts-64">{panel.body}</p>
            <Link href={panel.href} className="feature__link u-body-2">
              {panel.cta} →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
