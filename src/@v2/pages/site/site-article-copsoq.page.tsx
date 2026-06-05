import { useEffect } from 'react';
import Link from 'next/link';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import { SITE_ARTICLE_COPSOQ } from './constants/site-article-copsoq.constant';

export function SiteArticleCopsoqPage() {
  useEffect(() => {
    document.documentElement.classList.add('lp-scroll');
    return () => document.documentElement.classList.remove('lp-scroll');
  }, []);

  const { methodology } = SITE_ARTICLE_COPSOQ;

  return (
    <div className="lp">
      <SiteHeader />
      <main className="lp-main lp-article">
        <div className="lp-wrap lp-wrap--narrow">
          <header className="lp-article__header">
            <p className="lp-label">Artigo técnico</p>
            <h1 className="lp-display" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>
              {SITE_ARTICLE_COPSOQ.title}
            </h1>
            <p className="lp-lead" style={{ marginTop: '0.75rem' }}>
              {SITE_ARTICLE_COPSOQ.subtitle}
            </p>
            <p className="lp-article__author">{SITE_ARTICLE_COPSOQ.author}</p>
          </header>

          <p className="lp-body lp-article__intro">{SITE_ARTICLE_COPSOQ.intro}</p>

          <div className="lp-article__highlights">
            {SITE_ARTICLE_COPSOQ.highlights.map((item) => (
              <article key={item.title} className="lp-article__highlight">
                <h2 className="lp-article__highlight-title">{item.title}</h2>
                <p className="lp-body">{item.text}</p>
              </article>
            ))}
          </div>
        </div>

        <section className="lp-article__methodology" aria-labelledby="lp-article-methodology-title">
          <div className="lp-wrap">
            <h2 id="lp-article-methodology-title" className="lp-h2 lp-article__methodology-title">
              {methodology.title}
            </h2>
            <p className="lp-body lp-article__methodology-intro">{methodology.intro}</p>

            <div className="lp-article__visuals">
              {methodology.visuals.map((visual, index) => (
                <article
                  key={visual.title}
                  className={`lp-article__visual${index % 2 === 1 ? ' lp-article__visual--reverse' : ''}`}
                >
                  <div className="lp-article__visual-media">
                    <img
                      src={visual.image}
                      alt={visual.imageAlt}
                      className="lp-article__visual-img"
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="lp-article__visual-copy">
                    <h3 className="lp-article__visual-title">{visual.title}</h3>
                    <p className="lp-body">{visual.text}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <div className="lp-wrap lp-wrap--narrow">
          <div className="lp-article__actions">
            <a
              href={SITE_ARTICLE_COPSOQ.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="lp-btn lp-btn--primary"
            >
              Baixar artigo completo em PDF
            </a>
            <Link href="/site#materiais" className="lp-btn lp-btn--secondary">
              Voltar para materiais
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
