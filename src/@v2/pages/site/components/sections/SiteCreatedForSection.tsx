import { SITE_CREATED_FOR } from '../../constants/site-content.constant';
import { LandingPicture } from '../LandingPicture';

export function SiteCreatedForSection() {
  return (
    <section
      className="lp-created-for"
      id="para-quem-foi-criado"
      aria-labelledby="lp-created-for-title"
    >
      <div className="lp-wrap">
        <header className="lp-section-head">
          <h2 id="lp-created-for-title" className="lp-h2">
            Para quem o SimpleSST foi criado
          </h2>
          <p className="lp-lead" style={{ marginTop: '0.75rem' }}>
            Uma única plataforma para diferentes perfis profissionais e diferentes níveis de maturidade
            em SST.
          </p>
        </header>

        <div className="lp-created-for__grid">
          {SITE_CREATED_FOR.map((item) => (
            <article key={item.title} className="lp-created-for-card">
              <div className="lp-created-for-card__copy">
                <h3>{item.title}</h3>
                <p className="lp-body">{item.description}</p>
              </div>
              <LandingPicture
                src={item.image}
                alt={item.imageAlt}
                className="lp-created-for-card__visual"
                objectPosition={item.objectPosition}
              />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
