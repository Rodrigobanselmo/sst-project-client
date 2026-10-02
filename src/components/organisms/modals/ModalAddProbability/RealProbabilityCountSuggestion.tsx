import { FC, useEffect, useMemo, useRef } from 'react';

import SText from 'components/atoms/SText';
import { IRiskData } from 'core/interfaces/api/IRiskData';
import { IUpsertRiskData } from 'core/services/hooks/mutations/checklist/riskData/useMutUpsertRiskData';

import {
  classifyMedsImplemented,
  countSuggestionEffectAction,
  countSuggestionSignature,
  ProbabilityCountSource,
  resolveCountSuggestion,
} from './qualitative-probability.util';
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
  const currentMedsImplemented = data
    ? classifyMedsImplemented({
        engs: data.engs,
        adms: data.adms,
        epis: data.epis,
      })
    : undefined;
  const decision = useMemo(
    () =>
      resolveCountSuggestion({
        adopted: data?.probabilityCriteria,
        adoptedProbability: data?.probability,
        currentTotal: counts.total,
        currentGho: counts.gho,
        currentMedsImplemented,
        isQuantity: !!data?.isQuantity,
      }),
    [
      counts.gho,
      counts.total,
      currentMedsImplemented,
      data?.isQuantity,
      data?.probability,
      data?.probabilityCriteria,
    ],
  );
  const trackingRef = useRef<string | null>(null);

  useEffect(() => {
    if (!counts.ready || data?.isQuantity) return;

    const action = countSuggestionEffectAction(trackingRef.current, decision);
    trackingRef.current = countSuggestionSignature(decision);
    if (action !== 'auto' || decision.kind !== 'auto') return;

    handleSelect({
      probability: decision.probability,
      probabilityCriteria: decision.criteria,
    });
    // handleSelect é recriado a cada render; o residual também o omite.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts.ready, data?.isQuantity, decision]);

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
