import Link from 'next/link';
import { SITE_BRAND } from '../constants/site-brand.constant';

const LOGIN_PATH = '/login';
const BRAND = 'SimpleSST';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer__grid">
          <div className="lp-footer__brand">
            <img
              src={SITE_BRAND.logoOnDark}
              alt={BRAND}
              className="lp-brand-logo lp-brand-logo--on-dark"
              decoding="async"
            />
            <p className="lp-footer__text">
              Gestão de SST com clareza, rastreabilidade e respeito ao trabalho técnico.
            </p>
          </div>
          <div className="lp-footer__links">
            <Link href="/politicas-de-privacidade">Política de Privacidade</Link>
            <Link href="/termos-de-uso">Termos de Uso</Link>
            <Link href={LOGIN_PATH} className="lp-btn lp-btn--outline-light">
              Acessar sistema
            </Link>
          </div>
        </div>
        <p className="lp-footer__copy">
          © {year} {BRAND} — Todos os direitos reservados
        </p>
      </div>
    </footer>
  );
}
