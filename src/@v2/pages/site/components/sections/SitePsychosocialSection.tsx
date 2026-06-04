import { SITE_IMAGES } from '../../constants/site-images.constant';
import { LandingPicture } from '../LandingPicture';

const HIGHLIGHTS = [
  {
    title: 'Metodologia aplicada',
    text: 'Questionários, indicadores e critérios organizados para apoiar a caracterização dos fatores de riscos psicossociais no PGR.',
  },
  {
    title: 'Sigilo preservado',
    text: 'Análise agregada por grupos, setores ou unidades, evitando exposição individual e apoiando decisões técnicas com segurança.',
  },
  {
    title: 'Integrado ao GRO',
    text: 'FRPS, inventário de riscos e plano de ação no mesmo fluxo de gestão — sem tratar o psicossocial como documento à parte.',
  },
] as const;

export function SitePsychosocialSection() {
  return (
    <section className="lp-psycho" id="psicossocial" aria-labelledby="lp-psycho-title">
      <div className="lp-psycho__media">
        <LandingPicture
          src={SITE_IMAGES.psychosocial}
          alt="Painel de FRPS com indicadores agregados, sigilo preservado, plano de ação e integração ao PGR"
          objectPosition="40% 50%"
        />
      </div>
      <div className="lp-psycho__content">
        <div className="lp-psycho__inner">
          <header className="lp-section-head lp-section-head--left">
            <h2 id="lp-psycho-title" className="lp-h2">
              FRPS no PGR, com método e segurança
            </h2>
            <p className="lp-body">
              Da coleta das respostas ao plano de ação: indicadores psicossociais analisados de forma
              agregada, com sigilo preservado e integração ao GRO/PGR.
            </p>
          </header>
          <ul className="lp-highlight-list">
            {HIGHLIGHTS.map((item) => (
              <li key={item.title}>
                <h3>{item.title}</h3>
                <p className="lp-body">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
