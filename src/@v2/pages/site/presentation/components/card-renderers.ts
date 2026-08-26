import type { ComponentType } from 'react';
import { PresentationCoverCard } from './cards/PresentationCoverCard';
import { PresentationProblemCard } from './cards/PresentationProblemCard';
import { PresentationWhatCard } from './cards/PresentationWhatCard';
import { PresentationFlowCard } from './cards/PresentationFlowCard';
import { PresentationOutputsCard } from './cards/PresentationOutputsCard';
import { PresentationWhyCard } from './cards/PresentationWhyCard';
import { PresentationCloseCard } from './cards/PresentationCloseCard';
import type { PresentationCardDefinition } from '../constants/presentation.constant';

export const PRESENTATION_CARD_RENDERERS: Partial<
  Record<PresentationCardDefinition['id'], ComponentType>
> = {
  '01': PresentationCoverCard,
  '02': PresentationProblemCard,
  '03': PresentationWhatCard,
  '04': PresentationFlowCard,
  '05': PresentationOutputsCard,
  '06': PresentationWhyCard,
  '07': PresentationCloseCard,
};
