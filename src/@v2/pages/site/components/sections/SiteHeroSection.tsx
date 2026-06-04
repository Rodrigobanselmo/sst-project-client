import Link from 'next/link';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { LandingPicture } from '../LandingPicture';

const LOGIN_PATH = '/login';

export function SiteHeroSection() {
  return (
    <section className="lp-hero" aria-labelledby="lp-hero-title">
      <div className="lp-wrap">
        <div className="lp-hero__grid">
          <div>
            <h1 id="lp-hero-title" className="lp-display">
              A gestão de SST que traz alívio
            </h1>
            <p className="lp-lead" style={{ marginTop: '1rem' }}>
              Clara, conectada e confiável.
            </p>
            <p className="lp-body" style={{ marginTop: '1rem' }}>
              Menos retrabalho, mais segurança na entrega. Riscos, documentos e plano de ação no mesmo
              fluxo — para sua equipe e seu cliente trabalharem com a mesma referência técnica.
            </p>
            <div className="lp-btn-row">
              <a href="#contato" className="lp-btn lp-btn--primary">
                Solicitar demonstração
              </a>
              <Link href={LOGIN_PATH} className="lp-btn lp-btn--secondary">
                Acessar sistema
              </Link>
            </div>
          </div>
          <LandingPicture
            src={SITE_IMAGES.hero}
            alt="Equipe de SST em ambiente de trabalho colaborativo"
            className="lp-hero__visual"
            objectPosition="62% 42%"
            priority
          />
        </div>
      </div>
    </section>
  );
}
