import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { SiteImageLightbox } from './components/SiteImageLightbox';
import { SITE_ERGONOMICS_EBOOK } from './constants/site-ergonomics-ebook.constant';

type EbookPreview = (typeof SITE_ERGONOMICS_EBOOK.previews)[number];

export function SiteErgonomicsEbookPage() {
  const [lightboxPreview, setLightboxPreview] = useState<EbookPreview | null>(null);

  useEffect(() => {
    document.documentElement.classList.add('lp-scroll');
    return () => document.documentElement.classList.remove('lp-scroll');
  }, []);

  return (
    <div className="lp">
      <SiteHeader />
      <main className="lp-main lp-ebook">
        <div className="lp-wrap">
          <header className="lp-ebook__header">
            <p className="lp-label">E-book gratuito</p>
            <h1 className="lp-display" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>
              {SITE_ERGONOMICS_EBOOK.title}
            </h1>
            <p className="lp-lead" style={{ marginTop: '0.75rem' }}>
              {SITE_ERGONOMICS_EBOOK.subtitle}
            </p>
          </header>

          <p className="lp-body lp-article__intro">{SITE_ERGONOMICS_EBOOK.summary}</p>
        </div>

        <section className="lp-ebook__hero" aria-label="Prévia do e-book">
          <div className="lp-wrap">
            <div className="lp-ebook__hero-grid">
              <div className="lp-ebook__preview">
                <div className="lp-ebook__cover-frame">
                  <img
                    src={SITE_ERGONOMICS_EBOOK.coverImage}
                    alt={SITE_ERGONOMICS_EBOOK.coverImageAlt}
                    className="lp-ebook__cover-img"
                    loading="eager"
                    decoding="async"
                  />
                </div>
              </div>

              <div className="lp-ebook__hero-copy">
                <h2 className="lp-h2" style={{ fontSize: '1.375rem' }}>
                  {SITE_ERGONOMICS_EBOOK.heroTitle}
                </h2>
                <p className="lp-body" style={{ marginTop: '0.75rem' }}>
                  {SITE_ERGONOMICS_EBOOK.heroText}
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="lp-wrap">
          <div className="lp-ebook__blocks">
            <section className="lp-ebook__block" aria-labelledby="lp-ebook-contents-title">
              <h2 id="lp-ebook-contents-title" className="lp-ebook__block-title">
                {SITE_ERGONOMICS_EBOOK.contentsTitle}
              </h2>
              <ul className="lp-ebook__list">
                {SITE_ERGONOMICS_EBOOK.contents.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="lp-ebook__block" aria-labelledby="lp-ebook-audience-title">
              <h2 id="lp-ebook-audience-title" className="lp-ebook__block-title">
                {SITE_ERGONOMICS_EBOOK.audienceTitle}
              </h2>
              <ul className="lp-ebook__list">
                {SITE_ERGONOMICS_EBOOK.audience.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>

        <section
          className="lp-ebook__previews"
          aria-labelledby="lp-ebook-previews-title"
        >
          <div className="lp-wrap">
            <header className="lp-ebook__previews-head">
              <h2 id="lp-ebook-previews-title" className="lp-h2">
                {SITE_ERGONOMICS_EBOOK.previewsTitle}
              </h2>
              <p className="lp-body lp-ebook__previews-subtitle">
                {SITE_ERGONOMICS_EBOOK.previewsSubtitle}
              </p>
            </header>

            <div className="lp-ebook__preview-cards">
              {SITE_ERGONOMICS_EBOOK.previews.map((preview) => (
                <article key={preview.title} className="lp-ebook__preview-card">
                  <button
                    type="button"
                    className="lp-ebook__preview-media-btn"
                    onClick={() => setLightboxPreview(preview)}
                    aria-label={`Ampliar imagem: ${preview.title}`}
                  >
                    <div className="lp-ebook__preview-media">
                      <img
                        src={preview.image}
                        alt={preview.imageAlt}
                        className="lp-ebook__preview-img"
                        loading="lazy"
                        decoding="async"
                      />
                      <span className="lp-ebook__preview-zoom">
                        <svg
                          className="lp-ebook__preview-zoom-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.25"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <circle cx="11" cy="11" r="7" />
                          <path d="M20 20l-3.5-3.5" />
                          <path d="M11 8v6M8 11h6" />
                        </svg>
                        Clique para ampliar
                      </span>
                    </div>
                  </button>
                  <h3 className="lp-ebook__preview-card-title">{preview.title}</h3>
                  <p className="lp-body lp-ebook__preview-card-text">{preview.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-wrap">
          <p className="lp-ebook__disclaimer" role="note">
            {SITE_ERGONOMICS_EBOOK.disclaimer}
          </p>

          <aside className="lp-ebook__cta" aria-label="Download e links relacionados">
            <div className="lp-article__actions lp-ebook__actions">
              <a
                href={SITE_ERGONOMICS_EBOOK.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-btn lp-btn--primary"
              >
                Baixar e-book em PDF
              </a>
              <Link href={SITE_ERGONOMICS_EBOOK.gymHref} className="lp-btn lp-btn--secondary">
                Ver vídeos de ginástica laboral
              </Link>
              <Link href="/site#materiais" className="lp-btn lp-btn--secondary">
                Voltar para materiais
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteImageLightbox
        image={lightboxPreview?.image ?? ''}
        alt={lightboxPreview?.imageAlt ?? ''}
        isOpen={lightboxPreview !== null}
        onClose={() => setLightboxPreview(null)}
      />
      <SiteFooter />
    </div>
  );
}
