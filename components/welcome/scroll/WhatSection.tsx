/**
 * Section 6 — "what will you do".
 *
 * Small quiet label on the left of a ruled split, oversized two-line statement
 * on the right that flashes in word by word. The label is deliberately plain:
 * all the weight in this section belongs to the statement, so the left side is
 * a caption, not a second headline.
 */
export function WhatSection() {
  return (
    <section id="what" className="what">
      <div className="what__left">
        <p className="what__txt u-fonts-100">what will you do</p>
      </div>
      <div className="what__right">
        <h2 className="what__title u-h2" data-flash>
          Real startups.
          <br />
          Real work.
        </h2>
      </div>
    </section>
  );
}
