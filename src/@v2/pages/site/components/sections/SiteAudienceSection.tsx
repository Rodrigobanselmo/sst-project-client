import { SITE_AUDIENCE } from '../../constants/site-content.constant';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { LandingPicture } from '../LandingPicture';

const AUDIENCE_ICONS: Record<(typeof SITE_AUDIENCE)[number]['title'], string> = {
  Empresas: '◆',
  Consultorias: '◇',
  SESMT: '◎',
  'Medicina ocupacional': '✚',
  'Profissionais de SST': '◉',
};

export function SiteAudienceSection() {
  return (
    <section className="lp-audience" id="para-quem-e" aria-labelledby="lp-audience-title">
      <div className="lp-wrap">
        <header className="lp-section-head">
          <h2 id="lp-audience-title" className="lp-h2">
            Feito para quem vive
            <br />
            <span style={{ whiteSpace: 'nowrap' }}>SST na prática</span>
          </h2>
          <p className="lp-body" style={{ maxWidth: '54rem' }}>
            Consultorias, empresas, SESMT e medicina ocupacional — para quem precisa transformar dados,
            laudos e planos de ação em gestão rastreável.
          </p>
        </header>

        <div className="lp-audience__stage">
          <LandingPicture
            src={SITE_IMAGES.audience}
            alt="Equipe multidisciplinar em SST com indicadores, laudos, planos de ação e gestão integrada"
            className="lp-audience__visual"
            objectPosition="50% 40%"
          />
          <div className="lp-audience__cards">
            {SITE_AUDIENCE.map((item) => (
              <article key={item.title} className="lp-audience-card">
                <span className="lp-audience-card__icon" aria-hidden>
                  {AUDIENCE_ICONS[item.title]}
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
