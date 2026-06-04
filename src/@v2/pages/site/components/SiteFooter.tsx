import Link from 'next/link';

const LOGIN_PATH = '/login';
const BRAND = 'SimpleSST';

export function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <div className="lp-footer__grid">
          <div className="lp-footer__brand">
            <img src="/site/simplesst-logo-horizontal.png" alt={BRAND} width={140} height={36} />
            <p className="lp-body" style={{ color: '#94a3b8', marginTop: '0.75rem' }}>
              Gestão de SST com clareza, rastreabilidade e respeito ao trabalho técnico.
            </p>
          </div>
          <div className="lp-footer__links">
            <Link href="/politicas-de-privacidade">Política de Privacidade</Link>
            <Link href="/termos-de-uso">Termos de Uso</Link>
            <Link href={LOGIN_PATH} className="lp-btn lp-btn--secondary" style={{ marginTop: '0.5rem' }}>
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
