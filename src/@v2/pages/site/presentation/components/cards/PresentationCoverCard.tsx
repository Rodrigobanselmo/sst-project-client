import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { PRESENTATION_COVER } from '../../constants/presentation.constant';

export function PresentationCoverCard() {
  return (
    <section className="lp-pres-cover is-entering" aria-labelledby="lp-pres-cover-title">
      <header className="lp-pres-cover__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-cover__logo"
          decoding="async"
        />
        <p className="lp-pres-cover__index">01 · Capa</p>
      </header>

      <div className="lp-pres-cover__main">
        <div className="lp-pres-cover__copy">
          <div className="lp-pres-cover__text">
            <p className="lp-pres-cover__kicker">{PRESENTATION_COVER.kicker}</p>
            <h1 id="lp-pres-cover-title" className="lp-pres-cover__title">
              {PRESENTATION_COVER.headline}
            </h1>
            <p className="lp-pres-cover__lead">{PRESENTATION_COVER.lead}</p>
            <p className="lp-pres-cover__support">{PRESENTATION_COVER.support}</p>
          </div>

          <ul className="lp-pres-cover__pillars">
            {PRESENTATION_COVER.pillars.map((pillar) => (
              <li key={pillar} className="lp-pres-cover__pillar">
                {pillar}
              </li>
            ))}
          </ul>
        </div>

        <div className="lp-pres-cover__visual-wrap">
          <img
            src={PRESENTATION_COVER.visualSrc}
            alt={PRESENTATION_COVER.visualAlt}
            className="lp-pres-cover__devices"
            decoding="async"
          />
        </div>
      </div>

      <footer className="lp-pres-cover__footer">
        <p className="lp-pres-cover__journey">
          {PRESENTATION_COVER.journey.map((step, index) => (
            <span key={step}>
              {index > 0 ? <span className="lp-pres-cover__journey-sep"> · </span> : null}
              <span>{step}</span>
            </span>
          ))}
        </p>
        <p className="lp-pres-cover__tagline">{PRESENTATION_COVER.footer}</p>
      </footer>
    </section>
  );
}
