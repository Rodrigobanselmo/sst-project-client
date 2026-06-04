import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { SITE_NAV_LINKS } from '../constants/site-content.constant';
import { SITE_BRAND } from '../constants/site-brand.constant';

const LOGIN_PATH = '/login';

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => {
    setMenuOpen(false);
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return undefined;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      window.addEventListener('keydown', onKeyDown);
    }
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return (
    <header className={`lp-header${menuOpen ? ' is-menu-open' : ''}`}>
      <div className="lp-wrap lp-header__inner">
        <a href="/site" className="lp-logo" aria-label="SimpleSST — início">
          <img
            src={SITE_BRAND.logoOnLight}
            alt="SimpleSST"
            className="lp-brand-logo lp-brand-logo--on-light"
            decoding="async"
          />
        </a>

        <nav className="lp-nav" aria-label="Seções da página">
          {SITE_NAV_LINKS.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="lp-header__actions">
          <a href="#contato" className="lp-btn lp-btn--primary lp-btn--compact">
            Solicitar demonstração
          </a>
          <Link href={LOGIN_PATH} className="lp-btn lp-btn--secondary lp-btn--compact">
            Acessar sistema
          </Link>
          <button
            type="button"
            className="lp-menu-toggle"
            aria-label={menuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuOpen}
            aria-controls="lp-mobile-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="lp-menu-toggle__bars" aria-hidden />
          </button>
        </div>
      </div>

      <div
        id="lp-mobile-menu"
        className={`lp-drawer${menuOpen ? ' is-open' : ''}`}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="lp-drawer__backdrop"
          aria-label="Fechar menu"
          tabIndex={menuOpen ? 0 : -1}
          onClick={closeMenu}
        />
        <div className="lp-drawer__panel" role="dialog" aria-modal="true" aria-label="Menu de navegação">
          <div className="lp-drawer__head">
            <p className="lp-drawer__title">Navegação</p>
            <button
              type="button"
              className="lp-drawer__close"
              aria-label="Fechar menu"
              onClick={closeMenu}
            >
              ×
            </button>
          </div>
          <nav className="lp-drawer__nav">
            {SITE_NAV_LINKS.map((item) => (
              <a key={item.href} href={item.href} onClick={closeMenu}>
                {item.label}
              </a>
            ))}
          </nav>
          <a href="#contato" className="lp-btn lp-btn--primary" onClick={closeMenu}>
            Solicitar demonstração
          </a>
          <Link href={LOGIN_PATH} className="lp-btn lp-btn--secondary" onClick={closeMenu}>
            Acessar sistema
          </Link>
        </div>
      </div>
    </header>
  );
}
