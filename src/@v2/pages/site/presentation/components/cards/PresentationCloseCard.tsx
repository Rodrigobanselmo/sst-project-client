import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { SITE_CONTACT, getSiteMailtoHref, getSiteWhatsAppHref } from '../../../constants/site-contact.constant';
import { PRESENTATION_CLOSE } from '../../constants/presentation.constant';

export function PresentationCloseCard() {
  const whatsappHref = getSiteWhatsAppHref();
  const mailtoHref = getSiteMailtoHref();

  return (
    <section className="lp-pres-close is-entering" aria-labelledby="lp-pres-close-title">
      <header className="lp-pres-close__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-close__logo"
          decoding="async"
        />
        <p className="lp-pres-close__index">07 · Vamos conversar</p>
      </header>

      <div className="lp-pres-close__main">
        <div className="lp-pres-close__copy">
          <p className="lp-pres-close__kicker">{PRESENTATION_CLOSE.kicker}</p>
          <h1 id="lp-pres-close-title" className="lp-pres-close__title">
            {PRESENTATION_CLOSE.headlineBefore}{' '}
            <span className="lp-pres-close__accent">{PRESENTATION_CLOSE.headlineAccent}</span>
          </h1>
          <p className="lp-pres-close__lead">{PRESENTATION_CLOSE.lead}</p>

          <a className="lp-pres-close__cta" href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <svg className="lp-pres-close__cta-line" viewBox="0 0 72 12" preserveAspectRatio="none" aria-hidden>
              <path d="M0 6 H46" />
              <rect x="46" y="3.1" width="5.8" height="5.8" />
              <path d="M51.8 6 H72" />
            </svg>
            <span className="lp-pres-close__cta-label">{PRESENTATION_CLOSE.cta}</span>
          </a>
        </div>

        <aside className="lp-pres-close__aside">
          <figure className="lp-pres-close__qr-block">
            <img
              src={PRESENTATION_CLOSE.qrSrc}
              alt="QR Code da Google Play para o aplicativo SimpleSST"
              className="lp-pres-close__qr"
              decoding="async"
            />
            <figcaption>
              <p className="lp-pres-close__qr-title">{PRESENTATION_CLOSE.qrTitle}</p>
              <p className="lp-pres-close__qr-caption">{PRESENTATION_CLOSE.qrCaption}</p>
            </figcaption>
          </figure>

          <ul className="lp-pres-close__contacts">
            <li>
              <span>WhatsApp</span>
              <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
                {SITE_CONTACT.whatsappDisplay}
              </a>
            </li>
            <li>
              <span>E-mail</span>
              <a href={mailtoHref}>{SITE_CONTACT.email}</a>
            </li>
          </ul>
        </aside>
      </div>

      <div className="lp-pres-close__proof">
        <p className="lp-pres-close__proof-label">{PRESENTATION_CLOSE.proofLabel}</p>
        <ul className="lp-pres-close__logos">
          {PRESENTATION_CLOSE.logos.map((logo) => (
            <li key={logo.id} className={`lp-pres-close__logo-item is-${logo.fit}`}>
              <img src={logo.src} alt={logo.alt} className="lp-pres-close__brand" decoding="async" />
            </li>
          ))}
        </ul>
      </div>

      <footer className="lp-pres-close__footer">
        <p className="lp-pres-close__closing">
          {PRESENTATION_CLOSE.closingBefore}{' '}
          <span className="lp-pres-close__closing-accent">{PRESENTATION_CLOSE.closingAccent}</span>
        </p>
      </footer>
    </section>
  );
}
