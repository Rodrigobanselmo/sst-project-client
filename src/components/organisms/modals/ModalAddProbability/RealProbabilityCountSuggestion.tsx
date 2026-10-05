import { FC, useEffect, useMemo, useRef } from 'react';

import SText from 'components/atoms/SText';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import {
  countSuggestionEffectAction,
  countSuggestionSignature,
  ProbabilityCountSource,
  resolveCountSuggestion,
} from './qualitative-probability.util';
import { useApplicableJourneys } from './use-applicable-journeys';
import { useLiveEmployeeCounts } from './use-live-employee-counts';

type Props = {
  data?: Partial<IRiskData> | null;
  countSource?: ProbabilityCountSource;
  handleSelect: (values: Partial<IUpsertRiskData>) => void;
};

export const RealProbabilityCountSuggestion: FC<Props> = ({
  data,
  countSource,
  handleSelect,
}) => {
  const counts = useLiveEmployeeCounts(countSource);
  const journeys = useApplicableJourneys(countSource);
  const decision = useMemo(
    () =>
      resolveCountSuggestion({
        adopted: data?.probabilityCriteria,
        adoptedProbability: data?.probability,
        currentTotal: counts.total,
        currentGho: counts.gho,
        currentJourneyMinutes: journeys.ready
          ? journeys.suggestedMinutes
          : undefined,
        isQuantity: !!data?.isQuantity,
      }),
    [
      counts.gho,
      counts.total,
      data?.isQuantity,
      data?.probability,
      data?.probabilityCriteria,
      journeys.ready,
      journeys.suggestedMinutes,
    ],
  );
  const trackingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!counts.ready || !journeys.ready || data?.isQuantity) return;

    const action = countSuggestionEffectAction(trackingRef.current, decision);
    trackingRef.current = countSuggestionSignature(decision);
    if (action !== 'auto' || decision.kind !== 'auto') return;

    handleSelect({
      probability: decision.probability,
      probabilityCriteria: decision.criteria,
    });
    // handleSelect é recriado a cada render; o residual também o omite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts.ready, data?.isQuantity, decision, journeys.ready]);

  if (decision.kind === 'none' || data?.isQuantity) return null;

  return (
    <SText
      fontSize={11}
      color="info.main"
      sx={{ cursor: 'pointer', lineHeight: 1.3, maxWidth: 160 }}
      onClick={() =>
        handleSelect({
          probability: decision.probability,
          probabilityCriteria: decision.criteria,
        })
      }
    >
      {`Sugestão atual: P${decision.probability}`}
    </SText>
  );
};
