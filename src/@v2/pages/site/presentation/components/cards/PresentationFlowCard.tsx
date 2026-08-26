import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { PRESENTATION_FLOW } from '../../constants/presentation.constant';
import { PRESENTATION_FLOW_ICONS } from './PresentationFlowIcons';
import { PresentationFlowCircuit } from './PresentationFlowCircuit';

export function PresentationFlowCard() {
  return (
    <section className="lp-pres-flow is-entering" aria-labelledby="lp-pres-flow-title">
      <header className="lp-pres-flow__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-flow__logo"
          decoding="async"
        />
        <p className="lp-pres-flow__index">04 · Como funciona</p>
      </header>

      <div className="lp-pres-flow__copy">
        <p className="lp-pres-flow__kicker">{PRESENTATION_FLOW.kicker}</p>
        <h1 id="lp-pres-flow-title" className="lp-pres-flow__title">
          {PRESENTATION_FLOW.headlineBefore}{' '}
          <span className="lp-pres-flow__accent">{PRESENTATION_FLOW.headlineAccent}</span>
        </h1>
        <p className="lp-pres-flow__lead">{PRESENTATION_FLOW.lead}</p>
      </div>

      <div
        className="lp-pres-flow__board"
        role="img"
        aria-label="Fluxo SimpleSST: cadastro e caracterização estruturam a operação; o inventário de riscos alimenta plano de ação, documentos, gestão contínua e evidências, que reavaliam o inventário"
      >
        <p className="lp-pres-flow__phase is-entry">{PRESENTATION_FLOW.phases.entry}</p>
        <p className="lp-pres-flow__phase is-cycle">{PRESENTATION_FLOW.phases.cycle}</p>

        <PresentationFlowCircuit />

        <div className="lp-pres-flow__trail" aria-hidden>
          <svg className="lp-pres-flow__trail-map" viewBox="0 0 700 46" preserveAspectRatio="none">
            <path className="lp-pres-flow__trail-bus" d="M50 28 H650" />
            <path className="lp-pres-flow__trail-spine" d="M50 23 H650" />
            <path
              className="lp-pres-flow__trail-tap"
              d="M100 23 V33 M200 23 V31 M400 23 V33 M500 23 V31 M600 23 V33"
            />
          </svg>
          <span className="lp-pres-flow__trail-join" style={{ left: '14.286%' }} />
          <span className="lp-pres-flow__trail-join" style={{ left: '28.571%' }} />
          <span className="lp-pres-flow__trail-join" style={{ left: '42.857%' }} />
          <span className="lp-pres-flow__trail-join" style={{ left: '57.143%' }} />
          <span className="lp-pres-flow__trail-join" style={{ left: '71.429%' }} />
          <span className="lp-pres-flow__trail-join" style={{ left: '85.714%' }} />
          <span className="lp-pres-flow__trail-packet" style={{ left: '11.2%' }} />
          <span className="lp-pres-flow__trail-packet" style={{ left: '32.6%' }} />
          <span className="lp-pres-flow__trail-packet" style={{ left: '68.3%' }} />
          <span className="lp-pres-flow__trail-packet" style={{ left: '89.7%' }} />
        </div>

        <ol className="lp-pres-flow__steps">
          {PRESENTATION_FLOW.steps.map((step) => {
            const Icon = PRESENTATION_FLOW_ICONS[step.n];

            return (
              <li key={step.n} className={`lp-pres-flow__step is-${step.role}`}>
                <span className="lp-pres-flow__node-well">
                  <span className="lp-pres-flow__node" aria-hidden>
                    {step.n}
                  </span>
                </span>
                <span className="lp-pres-flow__pict" aria-hidden>
                  <Icon />
                </span>
                <h2 className="lp-pres-flow__step-title">{step.title}</h2>
                <p className="lp-pres-flow__step-copy">{step.copy}</p>
              </li>
            );
          })}
        </ol>

        <div className="lp-pres-flow__return">
          <svg className="lp-pres-flow__return-map" viewBox="0 0 100 36" aria-hidden>
            <defs>
              <marker
                id="lp-pres-flow-arrow"
                viewBox="0 0 10 10"
                refX="5.2"
                refY="5"
                markerWidth="4.2"
                markerHeight="4.2"
                orient="auto"
              >
                <path d="M1.1 1.3 L8.9 5 L1.1 8.7 Z" fill="var(--lp-ink)" />
              </marker>
            </defs>
            <path
              className="lp-pres-flow__return-halo"
              d="M90 13.2 L90 21.2 C90 31.6 10 31.6 10 21.2 L10 13.2"
            />
            <path
              className="lp-pres-flow__return-path"
              d="M90 13.2 L90 21.2 C90 31.6 10 31.6 10 21.2 L10 13.2"
              markerEnd="url(#lp-pres-flow-arrow)"
            />
          </svg>
          <p className="lp-pres-flow__return-label">{PRESENTATION_FLOW.returnLabel}</p>
        </div>
      </div>

      <footer className="lp-pres-flow__footer">
        <p className="lp-pres-flow__closing">{PRESENTATION_FLOW.closing}</p>
      </footer>
    </section>
  );
}
