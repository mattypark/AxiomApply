import Link from "next/link";

/**
 * Section 7 — the three feature blocks.
 *
 * One full-width block over a two-up row, each with a dotted tag, a flashing
 * headline, and an image grid whose overlay renders cross-fade on a loop
 * (`is-img-anima-*`, driven by ScrollMotion).
 *
 * Imagery under /public/media is placeholder — real photography at the same
 * intrinsic dimensions drops in without reflowing anything.
 */

function Arrow() {
  return (
    <span className="ai__grid-arrow w-embed">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 12h16m-6-6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

export function FeatureSection() {
  return (
    <section className="ai">
      {/* 7a — the feed */}
      <div className="ai__block anchor-pdp" id="feed">
        <div className="ai__top">
          <Link href="/internships" className="ai__btn" aria-label="Open the feed">
            <span className="ai__btn-icon w-embed">
              <svg viewBox="0 0 16 16" fill="none" aria-hidden="true">
                <path
                  d="M4 12L12 4M6 4h6v6"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </Link>
          <div className="ai__tag">
            <span className="ai__dot" />
            <span className="ai__txt u-title-2 u-fonts-100">The feed</span>
          </div>

          <div className="ai__title">
            <h3 className="ai__subtitle u-h3" data-flash>
              12,597 internships,
              <br />
              open to everyone.
            </h3>
            <p className="u-body-2 u-fonts-64">
              That&apos;s how many live listings the feed shows you — pulled
              <br />
              automatically from the best trackers and lists, refreshed daily.
              <br />
              They aren&apos;t ours; we just put them in one place, no gate, no cut.
            </p>
            <p className="u-body-2 u-fonts-50">
              Our own network is far smaller and matched by hand —
              <br />
              we&apos;re a nonprofit, and it grows as fast as two people can grow it.
            </p>
          </div>

          {/* desktop grid */}
          <div className="ai__grid">
            <div className="ai__grid-card">
              <img
                className="ai__grid-asset theme-dark"
                src="/media/grid-01-dark.avif"
                alt=""
              />
              <img
                className="ai__grid-asset theme-light"
                src="/media/grid-01.avif"
                alt=""
              />
            </div>
            <Arrow />
            <div className="ai__grid-screen">
              <img
                className="ai__grid-asset is-right theme-dark"
                src="/media/grid-02-dark.avif"
                alt=""
              />
              <img
                className="ai__grid-asset is-right theme-light"
                src="/media/grid-02-light.avif"
                alt=""
              />
            </div>
          </div>

          {/* tablet/mobile grid */}
          <div className="ai__grid-alt">
            <div className="ai__grid-alt__side">
              <div className="ai__grid-alt__img">
                <img src="/media/grid-mob-01.avif" alt="" />
              </div>
              <div className="ai__grid-alt__img-2">
                <img src="/media/grid-mob-02.avif" alt="" />
              </div>
            </div>
            <div className="ai__grid-alt__md">
              <div className="ai__grid-alt__img-main">
                <img src="/media/grid-mob-03.avif" alt="" />
              </div>
            </div>
            <div className="ai__grid-alt__side">
              <div className="ai__grid-alt__img-2">
                <img src="/media/grid-mob-04.avif" alt="" />
              </div>
              <div className="ai__grid-alt__img">
                <img src="/media/grid-mob-05.avif" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 7b + 7c — two-up bottom row */}
      <div className="ai__bottom">
        <div className="ai__left anchor-products" id="network">
          <div className="ai__tag">
            <span className="ai__dot" />
            <span className="ai__txt u-title-2 u-fonts-100">The network</span>
          </div>
          <div className="ai__title">
            <h3 className="ai__subtitle u-h3" data-flash>
              Matched by hand, one at a time.
            </h3>
            <p className="u-body-2 u-fonts-64">
              10+ startups we place people into ourselves —
              <br />
              FinalDose, TypeOS, Corgi, Anvara, and a few still stealth.
            </p>
          </div>

          <div className="ai__grid-small">
            <div className="ai__grid-small-left">
              <img
                className="ai__grid-asset is-left is-img-anima-1"
                src="/media/ai-img-01-upd.avif"
                alt=""
              />
              <img
                className="ai__grid-asset is-left"
                src="/media/ai-img-01.avif"
                alt=""
              />
            </div>
            <div className="ai__grid-small-collage">
              <div className="ai__grid-small-md">
                <img className="ai__grid-asset" src="/media/ai-img-02.avif" alt="" />
                <img
                  className="ai__grid-asset is-img-anima-4"
                  src="/media/ai-img-02-upd.avif"
                  alt=""
                />
              </div>
              <div className="ai__grid-small-bottom">
                <div className="ai__grid-small-lg">
                  <img
                    className="ai__grid-asset"
                    src="/media/ai-img-03.avif"
                    alt=""
                  />
                  <img
                    className="ai__grid-asset is-img-anima-3"
                    src="/media/ai-img-03-upd.avif"
                    alt=""
                  />
                </div>
              </div>
            </div>
            <div className="ai__grid-small-right">
              <img
                className="ai__grid-asset is-right is-img-anima-2"
                src="/media/ai-img-05-upd.avif"
                alt=""
              />
              <img
                className="ai__grid-asset is-right"
                src="/media/ai-img-05.avif"
                alt=""
              />
            </div>
          </div>
        </div>

        <div className="ai__right anchor-video" id="learn">
          <div className="ai__tag">
            <span className="ai__dot" />
            <span className="ai__txt u-title-2 u-fonts-100">Learn</span>
          </div>
          <div className="ai__title">
            <h3 className="ai__subtitle u-h3" data-flash>
              Tracks that end
              <br />
              in something shipped.
            </h3>
            <p className="u-body-2 u-fonts-64">
              AI, engineering, marketing. Finish one and it
              <br />
              shows on your file the next time you apply.
            </p>
          </div>

          <div className="video__asset">
            <video
              className="bg-video"
              src="/media/feature-video.mp4"
              autoPlay
              muted
              playsInline
              loop
              preload="metadata"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
