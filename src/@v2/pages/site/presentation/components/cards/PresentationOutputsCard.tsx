import { SITE_BRAND } from '../../../constants/site-brand.constant';
import { PRESENTATION_OUTPUTS } from '../../constants/presentation.constant';
import { PRESENTATION_OUTPUT_ACTION_ICONS, PRESENTATION_OUTPUT_ICONS } from './PresentationOutputsIcons';

type OutputAction = {
  id: string;
  title: string;
  actions: readonly { id: string; label: string }[];
};

type OutputChild = string | { id: string; title: string } | OutputAction;

const RISK_MATRIX = [
  [1, 2, 3, 4, 4],
  [1, 2, 3, 3, 4],
  [0, 1, 2, 3, 4],
  [0, 0, 1, 2, 3],
  [0, 0, 0, 1, 2],
] as const;

function hasChildren(node: { children?: readonly OutputChild[] }): node is { children: readonly OutputChild[] } {
  return Boolean(node.children?.length);
}

function childTitle(child: OutputChild) {
  return typeof child === 'string' ? child : child.title;
}

function childIcon(child: OutputChild) {
  return typeof child === 'string' || 'actions' in child ? null : PRESENTATION_OUTPUT_ICONS[child.id];
}

function isActionChild(child: OutputChild): child is OutputAction {
  return typeof child === 'object' && 'actions' in child;
}

function OutputsAiFigure() {
  return (
    <div className="lp-pres-out__ai" aria-hidden>
      <img
        src={PRESENTATION_OUTPUTS.aiSrc}
        alt=""
        className="lp-pres-out__ai-mark"
        decoding="async"
      />
    </div>
  );
}

function OutputsRiskBridge() {
  return (
    <div className="lp-pres-out__bridge" aria-hidden>
      <svg className="lp-pres-out__bridge-map" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path className="lp-pres-out__trace" d="M4.2 16.7 H12.4 V38" />
        <path className="lp-pres-out__trace" d="M4.2 50 H12.4 V38" />
        <path className="lp-pres-out__trace is-bus" d="M12.4 38 H15.4" />
        <rect className="lp-pres-out__pad is-accent" x="11.1" y="36.7" width="2.6" height="2.6" />
      </svg>
      <div className="lp-pres-out__matrix">
        {RISK_MATRIX.flatMap((row, rowIndex) =>
          row.map((tone, colIndex) => (
            <span key={`${rowIndex}-${colIndex}`} className="lp-pres-out__matrix-cell" data-tone={tone} />
          )),
        )}
      </div>
      <p className="lp-pres-out__matrix-label">{PRESENTATION_OUTPUTS.matrixLabel}</p>
    </div>
  );
}

export function PresentationOutputsCard() {
  return (
    <section className="lp-pres-out is-entering" aria-labelledby="lp-pres-out-title">
      <header className="lp-pres-out__header">
        <img
          src={SITE_BRAND.logoOnLight}
          alt="SimpleSST"
          className="lp-brand-logo lp-pres-out__logo"
          decoding="async"
        />
        <p className="lp-pres-out__index">05 · Entregas</p>
      </header>

      <OutputsAiFigure />

      <div className="lp-pres-out__copy">
        <p className="lp-pres-out__kicker">{PRESENTATION_OUTPUTS.kicker}</p>
        <h1 id="lp-pres-out-title" className="lp-pres-out__title">
          {PRESENTATION_OUTPUTS.headlineBefore}{' '}
          <span className="lp-pres-out__accent">{PRESENTATION_OUTPUTS.headlineAccent}</span>
        </h1>
        <p className="lp-pres-out__lead">{PRESENTATION_OUTPUTS.lead}</p>
      </div>

      <div
        className="lp-pres-out__board"
        role="img"
        aria-label="SimpleSST como origem das entregas de SST. PGR e GRO e fatores de risco psicossociais NR-1 convergem para uma matriz de risco 5 por 5. Inteligência computacional assiste o processamento, sem substituir a decisão técnica."
      >
        <div className="lp-pres-out__origin">
          <img
            src={PRESENTATION_OUTPUTS.originSrc}
            alt=""
            className="lp-pres-out__origin-mark"
            decoding="async"
          />
        </div>

        <div className="lp-pres-out__split" aria-hidden>
          <svg className="lp-pres-out__split-map" viewBox="0 0 72 100" preserveAspectRatio="none">
            <path className="lp-pres-out__trace is-bus" d="M0 50 H22" />
            <path className="lp-pres-out__trace" d="M22 50 V18 H40 V16.7 H72" />
            <path className="lp-pres-out__trace is-bus" d="M22 50 H72" />
            <path className="lp-pres-out__trace" d="M22 50 V82 H40 V83.3 H72" />
            <rect className="lp-pres-out__pad is-accent" x="20.1" y="48.1" width="3.8" height="3.8" />
            <rect className="lp-pres-out__pad" x="38.7" y="15.4" width="2.6" height="2.6" />
            <rect className="lp-pres-out__pad" x="69.2" y="15.4" width="2.6" height="2.6" />
            <rect className="lp-pres-out__pad" x="69.2" y="48.7" width="2.6" height="2.6" />
            <rect className="lp-pres-out__pad" x="38.7" y="82" width="2.6" height="2.6" />
            <rect className="lp-pres-out__pad" x="69.2" y="82" width="2.6" height="2.6" />
          </svg>
        </div>

        <div className="lp-pres-out__tree">
          <OutputsRiskBridge />

          {PRESENTATION_OUTPUTS.rails.map((rail) => (
            <div key={rail.id} className={`lp-pres-out__rail is-${rail.id}`}>
              <svg className="lp-pres-out__rail-map" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden>
                {rail.id === 'programas' ? (
                  <path className="lp-pres-out__trace is-bus" d="M0 20 H18 V14 H38 V20 H62 V16 H100" />
                ) : null}
                {rail.id === 'central' ? (
                  <path className="lp-pres-out__trace is-bus" d="M0 20 H28 V20 H58 V14 H78 V20 H100" />
                ) : null}
                {rail.id === 'gestao' ? (
                  <path className="lp-pres-out__trace is-bus" d="M0 20 H20 V16 H46 V24 H72 V20 H100" />
                ) : null}
              </svg>

              {rail.nodes.map((node) => {
                const Icon = PRESENTATION_OUTPUT_ICONS[node.id];
                const kids = hasChildren(node) ? node.children : null;

                return (
                  <article
                    key={node.id}
                    className={`lp-pres-out__node${kids ? ' has-kids' : ''}${node.id === 'psico' ? ' is-psico' : ''}`}
                  >
                    <div className="lp-pres-out__head">
                      <span className="lp-pres-out__pict" aria-hidden>
                        <Icon />
                      </span>
                      <h2 className="lp-pres-out__node-title">{node.title}</h2>
                    </div>
                    {kids ? (
                      <ul className="lp-pres-out__kids">
                        {kids.map((child) => {
                          const KidIcon = childIcon(child);
                          const title = childTitle(child);

                          if (isActionChild(child)) {
                            return (
                              <li key={child.id} className="lp-pres-out__kid is-actions">
                                <span>{child.title}</span>
                                <span className="lp-pres-out__actions">
                                  {child.actions.map((action) => {
                                    const ActionIcon = PRESENTATION_OUTPUT_ACTION_ICONS[action.id];
                                    return (
                                      <span
                                        key={action.id}
                                        className="lp-pres-out__action"
                                        title={action.label}
                                        aria-label={action.label}
                                      >
                                        <ActionIcon />
                                      </span>
                                    );
                                  })}
                                </span>
                              </li>
                            );
                          }

                          return (
                            <li key={title} className={`lp-pres-out__kid${KidIcon ? ' is-pict' : ''}`}>
                              {KidIcon ? (
                                <span className="lp-pres-out__kid-pict" aria-hidden>
                                  <KidIcon />
                                </span>
                              ) : null}
                              {title}
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <footer className="lp-pres-out__footer">
        <p className="lp-pres-out__closing">{PRESENTATION_OUTPUTS.closing}</p>
      </footer>
    </section>
  );
}
