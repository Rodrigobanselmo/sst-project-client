import Link from 'next/link';
import { SITE_CONTACT, getSiteWhatsAppHref } from '../../constants/site-contact.constant';

const LOGIN_PATH = '/login';

export function SiteContactSection() {
  const whatsAppHref = getSiteWhatsAppHref();

  return (
    <section className="lp-cta" id="contato" aria-labelledby="lp-cta-title">
      <div className="lp-wrap lp-wrap--narrow">
        <h2 id="lp-cta-title" className="lp-h2">
          Encontrou o caminho para uma SST mais leve?
        </h2>
        <p className="lp-body">
          Fale com nossa equipe sobre demonstração e implantação. Sem compromisso — só uma conversa
          para ver se faz sentido para sua operação.
        </p>
        <div className="lp-btn-row">
          <a
            href={`mailto:${SITE_CONTACT.email}?subject=${encodeURIComponent('Demonstração SimpleSST')}`}
            className="lp-btn lp-btn--primary"
          >
            Solicitar demonstração
          </a>
          <Link href={LOGIN_PATH} className="lp-btn lp-btn--ghost-light">
            Acessar sistema
          </Link>
        </div>
        {whatsAppHref ? (
          <a
            href={whatsAppHref}
            className="lp-btn lp-btn--text-light"
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: '1rem' }}
          >
            WhatsApp
          </a>
        ) : (
          <button type="button" className="lp-btn lp-btn--text-light" disabled style={{ marginTop: '1rem' }}>
            WhatsApp — em breve
          </button>
        )}
      </div>
    </section>
  );
}
