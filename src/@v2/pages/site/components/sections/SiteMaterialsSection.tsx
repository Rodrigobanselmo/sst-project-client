import { SITE_MATERIALS } from '../../constants/site-content.constant';

export function SiteMaterialsSection() {
  return (
    <section className="lp-materials" aria-labelledby="lp-materials-title">
      <div className="lp-wrap">
        <div className="lp-materials__row">
          <div>
            <p className="lp-label">Em breve</p>
            <h2 id="lp-materials-title" className="lp-h2" style={{ fontSize: '1.5rem' }}>
              Materiais gratuitos
            </h2>
            <p className="lp-body" style={{ marginTop: '0.5rem' }}>
              Artigos, e-books e referências de metodologia para sua equipe.
            </p>
          </div>
          <div className="lp-tags" role="list">
            {SITE_MATERIALS.map((m) => (
              <span key={m.title} className="lp-tag" role="listitem">
                {m.title}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
