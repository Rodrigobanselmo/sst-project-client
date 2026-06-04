import Link from 'next/link';
import { SITE_IMAGES } from '../../constants/site-images.constant';
import { LandingPicture } from '../LandingPicture';

const LOGIN_PATH = '/login';

export function SiteMainHeroSection() {
  return (
    <section className="lp-hero-main" aria-labelledby="lp-hero-main-title">
      <div className="lp-wrap">
        <div className="lp-hero-main__intro">
          <h1 id="lp-hero-main-title" className="lp-display">
            Do campo ao documento, em minutos.
          </h1>
          <p className="lp-lead" style={{ marginTop: '1rem' }}>
            Registre atividades em campo, utilize IA especializada em SST e transforme informações em
            riscos, fontes geradoras, planos de ação e documentos técnicos estruturados.
          </p>
          <p className="lp-body" style={{ marginTop: '1rem' }}>
            Criado por especialistas em Segurança do Trabalho, Higiene Ocupacional e Tecnologia para
            acelerar entregas sem abrir mão da qualidade técnica.
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
          src={SITE_IMAGES.heroMain}
          alt="Fluxo do SimpleSST: coleta em campo, IA especializada em SST, riscos e fontes geradoras, documentos técnicos e entrega ao profissional"
          className="lp-hero-main__visual"
          objectPosition="50% 48%"
          priority
        />
      </div>
    </section>
  );
}
