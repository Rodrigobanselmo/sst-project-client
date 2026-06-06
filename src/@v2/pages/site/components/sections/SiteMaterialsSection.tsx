import Link from 'next/link';
import {
  SITE_MATERIAL_CARDS,
  SITE_MATERIALS_INTRO,
  SITE_MATERIALS_UPCOMING,
} from '../../constants/site-content.constant';

export function SiteMaterialsSection() {
  return (
    <section className="lp-materials" id="materiais" aria-labelledby="lp-materials-title">
      <div className="lp-wrap">
        <header className="lp-materials__head">
          <h2 id="lp-materials-title" className="lp-h2" style={{ fontSize: '1.5rem' }}>
            Materiais gratuitos
          </h2>
          <p className="lp-body" style={{ marginTop: '0.5rem' }}>
            {SITE_MATERIALS_INTRO}
          </p>
        </header>

        <div className="lp-materials__cards">
          {SITE_MATERIAL_CARDS.map((card) => (
            <Link key={card.href} href={card.href} className="lp-materials__card">
              <h3 className="lp-materials__card-title">{card.title}</h3>
              <p className="lp-body">{card.description}</p>
            </Link>
          ))}
        </div>

        <p className="lp-materials__upcoming-label">Em desenvolvimento</p>
        <div className="lp-tags lp-tags--muted" role="list">
          {SITE_MATERIALS_UPCOMING.map((title) => (
            <span key={title} className="lp-tag lp-tag--muted" role="listitem">
              {title}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
