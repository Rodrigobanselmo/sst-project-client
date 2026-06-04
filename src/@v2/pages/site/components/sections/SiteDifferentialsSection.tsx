import { SITE_PILLARS } from '../../constants/site-content.constant';
import { LandingPicture } from '../LandingPicture';

export function SiteDifferentialsSection() {
  return (
    <section className="lp-pillars" aria-labelledby="lp-pillars-title">
      <div className="lp-wrap">
        <header className="lp-section-head">
          <h2 id="lp-pillars-title" className="lp-h2">
            Três pilares para entregar SST com mais segurança
          </h2>
          <p className="lp-body">
            Rastreabilidade, padrão e IA a serviço do profissional — não no lugar dele.
          </p>
        </header>

        <div className="lp-pillars__grid">
          {SITE_PILLARS.map((pillar) => (
            <article key={pillar.title} className="lp-pillar-card">
              <div className="lp-pillar-card__copy">
                <h3>{pillar.title}</h3>
                <p className="lp-body">{pillar.description}</p>
              </div>
              <LandingPicture
                src={pillar.image}
                alt={pillar.imageAlt}
                className="lp-pillar-card__visual"
                objectPosition={pillar.objectPosition}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
