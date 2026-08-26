import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { PRESENTATION_WHY } from '../../constants/presentation.constant';
import { PRESENTATION_WHY_PILLAR_ICONS, PRESENTATION_WHY_RESULT_ICONS } from './PresentationWhyIcons';

export function PresentationWhyCard() {
  return (
    <section className="lp-pres-why is-entering" aria-labelledby="lp-pres-why-title">
      <header className="lp-pres-why__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-why__logo"
          decoding="async"
        />
        <p className="lp-pres-why__index">06 · Por que o SimpleSST</p>
      </header>

      <div className="lp-pres-why__copy">
        <p className="lp-pres-why__kicker">{PRESENTATION_WHY.kicker}</p>
        <h1 id="lp-pres-why-title" className="lp-pres-why__title">
          {PRESENTATION_WHY.headlineBefore}{' '}
          <span className="lp-pres-why__accent">{PRESENTATION_WHY.headlineAccent}</span>
        </h1>
        <p className="lp-pres-why__lead">{PRESENTATION_WHY.lead}</p>
      </div>

      <div
        className="lp-pres-why__board"
        role="img"
        aria-label="Experiência prática, conhecimento técnico, conformidade e tecnologia com IA convergem para o SimpleSST, que gera menos retrabalho, rastreabilidade, decisões mais seguras, gestão continuamente atualizada e preparação para auditorias"
      >
        <ul className="lp-pres-why__pillars">
          {PRESENTATION_WHY.pillars.map((pillar) => {
            const Icon = PRESENTATION_WHY_PILLAR_ICONS[pillar.id];
            return (
              <li key={pillar.id} className="lp-pres-why__pillar">
                <h2 className="lp-pres-why__label is-in">{pillar.title}</h2>
                <span className="lp-pres-why__pict is-in" aria-hidden>
                  <Icon />
                </span>
              </li>
            );
          })}
        </ul>

        <svg className="lp-pres-why__join is-in" viewBox="0 0 48 100" preserveAspectRatio="none" aria-hidden>
          <path className="lp-pres-why__trace" pathLength="1" d="M48 50 H22 V12.5 H0" />
          <path className="lp-pres-why__trace" pathLength="1" d="M48 50 H16 V37.5 H0" />
          <path className="lp-pres-why__trace" pathLength="1" d="M48 50 H16 V62.5 H0" />
          <path className="lp-pres-why__trace" pathLength="1" d="M48 50 H22 V87.5 H0" />
          <rect className="lp-pres-why__pad is-accent" x="44.2" y="48.1" width="3.8" height="3.8" />
        </svg>

        <div className="lp-pres-why__core">
          <img
            src={PRESENTATION_WHY.originSrc}
            alt=""
            className="lp-pres-why__mark"
            decoding="async"
          />
          <p className="lp-pres-why__signature">{PRESENTATION_WHY.signature}</p>
        </div>

        <svg className="lp-pres-why__join is-out" viewBox="0 0 48 100" preserveAspectRatio="none" aria-hidden>
          <path className="lp-pres-why__trace is-out" pathLength="1" d="M0 50 H20 V10 H48" />
          <path className="lp-pres-why__trace is-out" pathLength="1" d="M0 50 H16 V30 H48" />
          <path className="lp-pres-why__trace is-bus" pathLength="1" d="M0 50 H48" />
          <path className="lp-pres-why__trace is-out" pathLength="1" d="M0 50 H16 V70 H48" />
          <path className="lp-pres-why__trace is-out" pathLength="1" d="M0 50 H20 V90 H48" />
          <rect className="lp-pres-why__pad is-accent" x="0" y="48.1" width="3.8" height="3.8" />
        </svg>

        <ul className="lp-pres-why__results">
          {PRESENTATION_WHY.results.map((result) => {
            const Icon = PRESENTATION_WHY_RESULT_ICONS[result.id];
            return (
              <li key={result.id} className="lp-pres-why__result">
                <span className="lp-pres-why__pict is-out" aria-hidden>
                  <Icon />
                </span>
                <h2 className="lp-pres-why__label is-out">{result.title}</h2>
              </li>
            );
          })}
        </ul>
      </div>

      <footer className="lp-pres-why__footer">
        <p className="lp-pres-why__closing">{PRESENTATION_WHY.closing}</p>
      </footer>
    </section>
  );
}
