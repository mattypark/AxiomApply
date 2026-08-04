import Link from "next/link";

/**
 * Section 9 — the pinned gradient slides.
 *
 * Ported 1:1 from fourmula-clone/index.html (`.list`). Each slide pins for one
 * viewport height while the outgoing card shrinks, tilts back into 3D and
 * picks up a small random Z rotation — see ScrollMotion. The four gradients
 * come from the ported tokens (`--slide-01`…`--slide-04`).
 */

type Slide = {
  /** Position class the CSS keys the gradient and artwork off. */
  order: "is-first" | "is-second" | "is-third" | "is-fourth";
  index: string;
  tag: string;
  title: [string, string];
  leftTag: string;
  rightTag: string;
  copy: [string, string, string];
  /** Caption on the image slot — says what photo belongs there. */
  art: string;
};

const SLIDES: Slide[] = [
  {
    order: "is-first",
    index: "01",
    art: "THE APPLICATION",
    tag: "(AP)",
    title: ["Apply once,", "properly."],
    leftTag: "Every one read by a person",
    rightTag: "No GPA filter",
    copy: ["Tell us what you have", "built and where you", "want to point it."],
  },
  {
    order: "is-second",
    index: "02",
    art: "THE REVIEW",
    tag: "(RD)",
    title: ["A person", "reads it."],
    leftTag: "14 days, either way",
    rightTag: "Links beat adjectives",
    copy: ["Not a filter, not a", "keyword scan. We look", "for evidence you ship."],
  },
  {
    order: "is-third",
    index: "03",
    art: "THE MATCH",
    tag: "(MT)",
    title: ["Matched to", "a startup."],
    leftTag: "2–4 candidates per role",
    rightTag: "Matched by hand",
    copy: ["The email names the", "startup, the role, and", "who you report to."],
  },
  {
    order: "is-fourth",
    index: "04",
    art: "WEEK ONE",
    tag: "(SH)",
    title: ["Ship in", "week one."],
    leftTag: "One narrow, real thing",
    rightTag: "Founders, not managers",
    copy: ["Something small and", "real in the first week.", "It sets the tone."],
  },
];

function InfoTag({ label }: { label: string }) {
  return (
    <div className="list__main__info-tag">
      <span className="list__main__info-tag-icon" />
      <span className="list__main__info-tag-text u-title-2">{label}</span>
    </div>
  );
}

export function StepsSection() {
  return (
    <section id="list" className="list">
      <div className="list__wrap">
        <div className="list__title">
          <h2 className="list__title-h1 u-h1 u-fonts-100" data-flash>
            From application
            <br />
            to shipped work.
          </h2>
          <p className="list__title-copy u-tag u-fonts-50">
            Free, always. Every applicant
            <br />
            hears back either way.
          </p>
        </div>

        <div className="list__main__wrap">
          {SLIDES.map((slide) => (
            <div className="list__main__slide" key={slide.index}>
              <div className="list__main__content__wrap">
                <div className={`list__main__content ${slide.order}`}>
                  <div className="list__main__top">
                    <div className="list__main__title">
                      <span className="list__main__tag u-title-3">{slide.tag}</span>
                      <h3 className="list__main__h2 u-h2-5">
                        {slide.title[0]}
                        <br />
                        {slide.title[1]}
                      </h3>
                      <span className="list__main__h1 u-h2">{slide.index}</span>
                    </div>

                    <div className="list__main__info">
                      <div className="list__main__info-left">
                        <div className="list__main__info-left-top">
                          <InfoTag label={slide.leftTag} />
                        </div>
                        <div className="list__main__info-left-bottom">
                          <p
                            className="list__main__info-copy u-title-3 u-indent u-fonts-50-stb"
                            data-flash-stb
                          >
                            {slide.copy[0]}
                            <br />
                            {slide.copy[1]}
                            <br />
                            {slide.copy[2]}
                          </p>
                        </div>
                      </div>
                      <div className="list__main__info-right">
                        <InfoTag label={slide.rightTag} />
                      </div>
                    </div>

                    <Link href="/apply" className="btn-primary-stb u-btn">
                      Apply now
                    </Link>
                  </div>

                  <div className={`list__main__bottom ${slide.order}`}>
                    {/* Image slot, held open until the real photography
                        exists. Square and fixed-size on purpose: the pinned
                        slide maths is measured at setup, so whatever lands
                        here later must not change the card's height. Swap the
                        div for an <img> at the same size and nothing moves. */}
                    <div className="list__main__slot" aria-hidden>
                      <span className="list__main__slot-label">
                        {slide.art}
                      </span>
                    </div>
                    <div className="list__main__bottom-gradient" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
