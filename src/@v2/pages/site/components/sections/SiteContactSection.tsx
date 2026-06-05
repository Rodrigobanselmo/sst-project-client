import {
  SITE_CONTACT,
  getSiteMailtoHref,
  getSiteWhatsAppHref,
} from '../../constants/site-contact.constant';

export function SiteContactSection() {
  const whatsAppHref = getSiteWhatsAppHref();
  const mailtoHref = getSiteMailtoHref();

  return (
    <section className="lp-cta lp-contact" id="contato" aria-labelledby="lp-cta-title">
      <div className="lp-wrap lp-wrap--narrow">
        <h2 id="lp-cta-title" className="lp-h2">
          Fale com a equipe SimpleSST
        </h2>
        <p className="lp-body">
          Quer conhecer a plataforma, solicitar uma demonstração ou entender como o SimpleSST pode se
          adaptar à sua operação? Fale com nossa equipe comercial.
        </p>

        <ul className="lp-contact__details">
          <li>
            <span className="lp-contact__label">WhatsApp</span>
            <a href={whatsAppHref} target="_blank" rel="noopener noreferrer">
              {SITE_CONTACT.whatsappDisplay}
            </a>
          </li>
          <li>
            <span className="lp-contact__label">E-mail</span>
            <a href={mailtoHref}>{SITE_CONTACT.email}</a>
          </li>
        </ul>

        <div className="lp-btn-row">
          <a
            href={whatsAppHref}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-btn lp-btn--primary"
          >
            Falar com especialista
          </a>
          <a href={mailtoHref} className="lp-btn lp-btn--ghost-light">
            Enviar e-mail
          </a>
        </div>
      </div>
    </section>
  );
}
