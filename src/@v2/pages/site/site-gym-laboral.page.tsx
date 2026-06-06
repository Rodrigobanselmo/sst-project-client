import { useEffect } from 'react';
import Link from 'next/link';
import { SiteFooter } from './components/SiteFooter';
import { SiteHeader } from './components/SiteHeader';
import {
  SITE_GYM_LABORAL,
  getGymLaboralEmbedUrl,
} from './constants/site-gym-laboral.constant';

export function SiteGymLaboralPage() {
  useEffect(() => {
    document.documentElement.classList.add('lp-scroll');
    return () => document.documentElement.classList.remove('lp-scroll');
  }, []);

  return (
    <div className="lp">
      <SiteHeader />
      <main className="lp-main lp-gym">
        <div className="lp-wrap">
          <header className="lp-gym__header">
            <p className="lp-label">Material gratuito</p>
            <h1 className="lp-display" style={{ fontSize: 'clamp(1.75rem, 5vw, 2.5rem)' }}>
              {SITE_GYM_LABORAL.title}
            </h1>
            <p className="lp-lead" style={{ marginTop: '0.75rem', maxWidth: '42rem' }}>
              {SITE_GYM_LABORAL.subtitle}
            </p>
          </header>

          <div className="lp-gym__videos">
            {SITE_GYM_LABORAL.videos.map((video) => (
              <article key={video.youtubeId} className="lp-gym__card">
                <div className="lp-gym__card-copy">
                  <h2 className="lp-gym__card-title">{video.title}</h2>
                  <p className="lp-body">{video.description}</p>
                  <p className="lp-gym__duration">Duração: {SITE_GYM_LABORAL.durationLabel}</p>
                </div>

                <div className="lp-gym__player">
                  <div className="lp-video-embed">
                    <iframe
                      src={getGymLaboralEmbedUrl(video.youtubeId)}
                      title={`Ginástica laboral — ${video.title}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  </div>
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-gym__youtube-link"
                  >
                    Abrir no YouTube
                  </a>
                </div>
              </article>
            ))}
          </div>

          <p className="lp-gym__disclaimer" role="note">
            {SITE_GYM_LABORAL.disclaimer}
          </p>

          <aside className="lp-gym__cta">
            <h2 className="lp-h2" style={{ fontSize: '1.375rem' }}>
              {SITE_GYM_LABORAL.ctaTitle}
            </h2>
            <div className="lp-article__actions" style={{ justifyContent: 'center', marginTop: '1rem' }}>
              <Link href={SITE_GYM_LABORAL.ctaHref} className="lp-btn lp-btn--primary">
                Falar com a equipe SimpleSST
              </Link>
              <Link href="/site#materiais" className="lp-btn lp-btn--secondary">
                Voltar para materiais
              </Link>
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
