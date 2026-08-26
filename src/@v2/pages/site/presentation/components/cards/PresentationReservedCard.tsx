import type { PresentationCardDefinition } from '../../constants/presentation.constant';

type PresentationReservedCardProps = {
  card: PresentationCardDefinition;
};

export function PresentationReservedCard({ card }: PresentationReservedCardProps) {
  return (
    <section className="lp-pres-reserved" aria-labelledby="lp-pres-reserved-title">
      <p className="lp-pres-reserved__label">{card.id}</p>
      <h1 id="lp-pres-reserved-title" className="lp-pres-reserved__title">
        {card.title}
      </h1>
    </section>
  );
}
