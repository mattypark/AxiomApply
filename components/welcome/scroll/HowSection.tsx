import Link from "next/link";

/**
 * Section 8 — "How it works".
 *
 * Ported from fourmula-clone/index.html (`.how`), minus the trusted-by logo
 * band (cut on request). The right column is a CSS marquee duplicated for a
 * seamless loop; ScrollMotion re-measures each line every frame and fades it
 * by how far it has travelled up the column. The duplicate column is
 * aria-hidden so a screen reader hears each item once.
 */

const STEPS = ["Places you", "Teaches you", "Backs you"] as const;

function StepColumn({ hidden }: { hidden?: boolean }) {
  return (
    <div className="how__column" aria-hidden={hidden || undefined}>
      {STEPS.map((step) => (
        <div className="how__item" key={step}>
          <h3 className="how__right-title u-h2">{step}</h3>
        </div>
      ))}
    </div>
  );
}

export function HowSection() {
  return (
    <section className="how">
      <div className="how__title">
        <p className="how__title-txt u-tag u-fonts-100">How It Works</p>
      </div>

      <div className="how__main">
        <div className="how__left">
          <h2 className="how__left-title u-h2">
            A <span className="fx-forest">network</span> that
          </h2>
          <Link href="/apply" className="btn-primary u-btn is-how">
            <span>Apply now</span>
          </Link>
        </div>

        <div className="how__right">
          <StepColumn />
          <StepColumn hidden />
        </div>
      </div>

    </section>
  );
}
