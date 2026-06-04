import Link from 'next/link';
import { useCallback, useState } from 'react';
import { SITE_NAV_LINKS } from '../constants/site-content.constant';
import { SITE_BRAND } from '../constants/site-brand.constant';

const LOGIN_PATH = '/login';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  return (
    <header className="lp-header">
      <div className="lp-wrap lp-header__inner">
        <a href="/site" className="lp-logo" aria-label="SimpleSST — início">
          <img src={SITE_BRAND.logoHorizontal} alt="SimpleSST" width={160} height={40} />
        </a>

        <nav className="lp-nav" aria-label="Seções da página">
          {SITE_NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="lp-header__actions">
          <Link href={LOGIN_PATH} className="lp-btn lp-btn--primary">
            Acessar sistema
          </Link>
          <button
            type="button"
            className="lp-menu-toggle"
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <span />
          </button>
        </div>
      </div>

      <div className={`lp-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <button
          type="button"
          className="lp-drawer__backdrop"
          aria-label="Fechar menu"
          onClick={closeMenu}
        />
        <div className="lp-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
          <a href="/site" className="lp-logo" onClick={closeMenu}>
            <img src={SITE_BRAND.logoHorizontal} alt="SimpleSST" width={140} height={36} />
          </a>
          <nav>
            {SITE_NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
            <Link href={LOGIN_PATH} className="lp-btn lp-btn--primary" onClick={closeMenu}>
              Acessar sistema
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
