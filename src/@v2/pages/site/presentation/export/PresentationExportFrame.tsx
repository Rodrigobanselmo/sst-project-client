import { PresentationSlide } from '../components/PresentationSlide';
import { PRESENTATION_CARD_RENDERERS } from '../components/card-renderers';
import { PresentationReservedCard } from '../components/cards/PresentationReservedCard';
import type { PresentationCardDefinition } from '../constants/presentation.constant';

type PresentationExportFrameProps = {
  card: PresentationCardDefinition;
};

export function PresentationExportFrame({ card }: PresentationExportFrameProps) {
  const Renderer = PRESENTATION_CARD_RENDERERS[card.id];

  return (
    <div className="lp-pres-export-stage">
      <PresentationSlide card={card} exporting>
        {Renderer ? <Renderer /> : <PresentationReservedCard card={card} />}
      </PresentationSlide>
    </div>
  );
}
