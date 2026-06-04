import { SITE_JOURNEY } from '../../constants/site-content.constant';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { LandingPicture } from '../LandingPicture';

export function SiteModulesSection() {
  return (
    <section className="lp-journey" aria-labelledby="lp-journey-title">
      <div className="lp-wrap">
        <header className="lp-section-head">
          <h2 id="lp-journey-title" className="lp-h2">
            Do mapeamento à{' '}
            <span style={{ whiteSpace: 'nowrap' }}>gestão viva do PGR</span>
          </h2>
          <p className="lp-body">
            Inventário, plano de ação, evidências e revisões no mesmo fluxo — para demonstrar que o
            PGR está implementado, rastreável e em evolução.
          </p>
        </header>

        <div className="lp-journey__grid">
          <ol className="lp-journey__steps">
            {SITE_JOURNEY.map((phase, index) => (
              <li key={phase.step} className="lp-step">
                <span className="lp-step__num" aria-hidden>
                  {index + 1}
                </span>
                <div>
                  <h3>{phase.step}</h3>
                  <p className="lp-body">{phase.summary}</p>
                  <div className="lp-step__tags">
                    {phase.modules.map((mod) => (
                      <span key={mod}>{mod}</span>
                    ))}
                  </div>
                </div>
              </li>
            ))}
          </ol>

          <div className="lp-journey__visual-wrap">
            <LandingPicture
              src={SITE_IMAGES.journey}
              alt="Fluxo do PGR: inventário, avaliação, plano de ação, evidências e revisões no painel e no app"
              className="lp-journey__visual"
              objectPosition="40% 50%"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
