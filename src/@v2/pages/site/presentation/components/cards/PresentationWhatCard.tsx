import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { PRESENTATION_WHAT } from '../../constants/presentation.constant';

const ORBIT = PRESENTATION_WHAT.orbit;

export function PresentationWhatCard() {
  return (
    <section className="lp-pres-what is-entering" aria-labelledby="lp-pres-what-title">
      <header className="lp-pres-what__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-what__logo"
          decoding="async"
        />
        <p className="lp-pres-what__index">03 · O que é</p>
      </header>

      <div className="lp-pres-what__main">
        <div className="lp-pres-what__copy">
          <p className="lp-pres-what__kicker">{PRESENTATION_WHAT.kicker}</p>
          <h1 id="lp-pres-what-title" className="lp-pres-what__title">
            {PRESENTATION_WHAT.headlineBefore}{' '}
            <span className="lp-pres-what__accent">{PRESENTATION_WHAT.headlineAccent}</span>
          </h1>
          <p className="lp-pres-what__lead">{PRESENTATION_WHAT.lead}</p>
        </div>

        <div className="lp-pres-what__orbit-slot">
          <div
            className="lp-pres-what__orbit"
            role="img"
            aria-label="SimpleSST no centro, conectando estrutura de trabalho, inventário de riscos, medidas de controle, plano de ação, evidências e acompanhamento, com GSE, LPP, AET e AEP, psicossociais COPSOQ III, programas e laudos, exames e indicadores"
          >
          <svg className="lp-pres-what__map" viewBox="0 0 100 100" aria-hidden>
            <ellipse
              className="lp-pres-what__ring"
              cx={ORBIT.cx}
              cy={ORBIT.cy}
              rx={ORBIT.rx}
              ry={ORBIT.ry}
              transform={`rotate(${ORBIT.rotate} ${ORBIT.cx} ${ORBIT.cy})`}
            />
            {PRESENTATION_WHAT.primary.map((node) => (
              <line
                key={`spoke-${node.label}`}
                className="lp-pres-what__spoke"
                x1={ORBIT.hubX}
                y1={ORBIT.hubY}
                x2={node.x}
                y2={node.y}
              />
            ))}
            {PRESENTATION_WHAT.associated.map((node) => (
              <line
                key={`link-${node.label}`}
                className="lp-pres-what__spoke is-soft"
                x1={ORBIT.hubX}
                y1={ORBIT.hubY}
                x2={node.x}
                y2={node.y}
              />
            ))}
            {PRESENTATION_WHAT.primary.map((node) => (
              <circle key={`dot-${node.label}`} className="lp-pres-what__dot" cx={node.x} cy={node.y} r="1.95" />
            ))}
            {PRESENTATION_WHAT.associated.map((node) => (
              <circle
                key={`sat-${node.label}`}
                className="lp-pres-what__sat"
                cx={node.x}
                cy={node.y}
                r="1.3"
              />
            ))}
          </svg>

          <p className="lp-pres-what__core">{PRESENTATION_WHAT.core}</p>

          <ul className="lp-pres-what__nodes">
            {PRESENTATION_WHAT.primary.map((node) => (
              <li
                key={node.label}
                className={`lp-pres-what__node is-${node.side}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
              >
                {node.label}
              </li>
            ))}
            {PRESENTATION_WHAT.associated.map((node) => (
              <li
                key={node.label}
                className={`lp-pres-what__node is-associated is-${node.side}${'stack' in node && node.stack ? ' is-stack' : ''}`}
                style={{ left: `${node.x}%`, top: `${node.y}%` }}
                title={'title' in node ? node.title : undefined}
              >
                {node.label}
              </li>
            ))}
          </ul>
          </div>
        </div>
      </div>

      <footer className="lp-pres-what__footer">
        <p className="lp-pres-what__closing">{PRESENTATION_WHAT.closing}</p>
      </footer>
    </section>
  );
}
