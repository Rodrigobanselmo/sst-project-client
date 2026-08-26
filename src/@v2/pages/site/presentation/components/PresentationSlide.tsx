import type { ReactNode } from 'react';
import type { PresentationCardDefinition } from '../constants/presentation.constant';

type PresentationSlideProps = {
  card: PresentationCardDefinition;
  children: ReactNode;
  exporting?: boolean;
};

export function PresentationSlide({ card, children, exporting = false }: PresentationSlideProps) {
  return (
    <article
      className={`lp-pres-slide${exporting ? ' is-exporting' : ''}`}
      data-presentation-card={card.id}
      data-presentation-slug={card.slug}
      data-presentation-export="slide"
      aria-label={`${card.id} ${card.title}`}
    >
      <div className="lp-pres-slide__frame">{children}</div>
    </article>
  );
}
