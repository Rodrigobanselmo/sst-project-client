import { SITE_SOLUTION_STORIES } from '../../constants/site-content.constant';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { LandingPicture } from '../LandingPicture';

export function SiteProblemsSection() {
  return (
    <section className="lp-problems" id="solucoes" aria-labelledby="lp-problems-title">
      <div className="lp-wrap">
        <header className="lp-section-head">
          <h2 id="lp-problems-title" className="lp-h2">
            Do problema ao alívio
          </h2>
          <p className="lp-lead">
            Quatro histórias reais sobre o que trava a SST — e como o SimpleSST organiza o caminho.
          </p>
          <p className="lp-body">
            Veja o que acontece hoje, o que isso custa e o que muda quando riscos, documentos e plano de
            ação ficam no mesmo fluxo.
          </p>
        </header>

        <div className="lp-problems__grid">
          <div className="lp-problems__media">
            <div className="lp-problems__media-stack">
              <LandingPicture
                src={SITE_IMAGES.problemLegacy}
                alt="Profissional de SST em escritório utilizando o painel do SimpleSST"
                className="lp-problems__visual lp-problems__visual--legacy"
                objectPosition="50% 42%"
              />
              <LandingPicture
                src={SITE_IMAGES.problemSolution}
                alt="Fluxo de documentos físicos para gestão digital no SimpleSST"
                className="lp-problems__visual lp-problems__visual--flow"
                objectPosition="48% 50%"
              />
            </div>
          </div>
          <ul className="lp-story-list">
            {SITE_SOLUTION_STORIES.map((story) => (
              <li key={story.problem}>
                <article className="lp-card">
                  <h3>{story.problem}</h3>
                  <p className="lp-label">O que acontece</p>
                  <p className="lp-body" style={{ color: 'var(--lp-ink-soft)', fontWeight: 500 }}>
                    {story.consequence}
                  </p>
                  <p className="lp-label" style={{ marginTop: '1rem' }}>
                    Com o SimpleSST
                  </p>
                  <p className="lp-body" style={{ color: 'var(--lp-ink-soft)', fontWeight: 500 }}>
                    {story.solution}
                  </p>
                  <p className="lp-story-benefit">{story.benefit}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
