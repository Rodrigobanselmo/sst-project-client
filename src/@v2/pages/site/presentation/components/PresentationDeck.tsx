import { PresentationSlide } from './PresentationSlide';
import { PRESENTATION_CARD_RENDERERS } from './card-renderers';
import { PresentationReservedCard } from './cards/PresentationReservedCard';
import type { PresentationCardDefinition } from '../constants/presentation.constant';

type PresentationDeckProps = {
  card: PresentationCardDefinition;
};

export function PresentationDeck({ card }: PresentationDeckProps) {
  const Renderer = PRESENTATION_CARD_RENDERERS[card.id];

  return (
    <div className="lp-pres-stage">
      <PresentationSlide card={card}>
        {Renderer ? <Renderer /> : <PresentationReservedCard card={card} />}
      </PresentationSlide>
    </div>
  );
}
