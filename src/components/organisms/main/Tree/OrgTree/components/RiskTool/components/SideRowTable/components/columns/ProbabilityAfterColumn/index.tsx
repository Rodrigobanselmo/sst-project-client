import React, { FC, useEffect, useMemo, useRef } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import {
  calculateSuggestedResidualProbability,
  isResidualProbabilityEmpty,
  shouldAutoApplySuggestedResidual,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';
import {
  isRecommendationRecTypeMissing,
  MISSING_REC_TYPE_RESIDUAL_HINT,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/isRecommendationRecTypeMissing.util';

import { SelectedNumber } from '../../SelectedNumber';
import { EpiColumnProps as ProbabilityColumnProps } from './types';

const RESIDUAL_BLOCKED_REASON =
  'O risco residual não pode ser maior que o risco real.';

export const ProbabilityAfterColumn: FC<
  { children?: any } & ProbabilityColumnProps
> = ({ handleSelect, data }) => {
  let disabled = true;

  if (data && data.recs && data.recs.length) disabled = false;
  const hasCurrentProbability = !!data?.probability;

  const recSignature = useMemo(
    () =>
      (data?.recs ?? [])
        .map((rec) => `${rec?.id ?? ''}:${rec?.recType ?? ''}:${rec?.status ?? ''}`)
        .join('|'),
    [data?.recs],
  );

  const suggested = useMemo(
    () =>
      calculateSuggestedResidualProbability(data?.probability, data?.recs),
    [data?.probability, data?.recs],
  );

  const trackingRef = useRef<{
    signature: string;
    realProbability?: number;
    suggested?: number;
  }>({ signature: '' });

  useEffect(() => {
    const prev = trackingRef.current;
    const hasBaseline = prev.signature !== '';
    const signatureChanged = hasBaseline && prev.signature !== recSignature;
    const realChanged =
      hasBaseline && prev.realProbability !== data?.probability;

    trackingRef.current = {
      signature: recSignature,
      realProbability: data?.probability,
      suggested,
    };

    if (!hasBaseline) return;
    if (!signatureChanged && !realChanged) return;
    if (suggested == null) return;
    if (
      !shouldAutoApplySuggestedResidual(
        data?.probabilityAfter,
        prev.suggested,
      )
    ) {
      return;
    }
    if (data?.probabilityAfter === suggested) return;

    handleSelect({ probabilityAfter: suggested });
    // handleSelect é recriado a cada render no RiskTool; não incluir nas deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recSignature, data?.probability, data?.probabilityAfter, suggested]);

  const showSuggestionHint =
    !disabled &&
    suggested != null &&
    (isResidualProbabilityEmpty(data?.probabilityAfter) ||
      data?.probabilityAfter !== suggested);

  const hasMissingRecType = useMemo(
    () => (data?.recs ?? []).some((rec) => isRecommendationRecTypeMissing(rec?.recType)),
    [data?.recs],
  );

  return (
    <SFlex direction="column" gap={2} alignItems="flex-start">
      <SelectedNumber
        handleSelect={(number) => handleSelect({ probabilityAfter: number })}
        selectedNumber={data?.probabilityAfter}
        disabledGtEqual={
          disabled ? 0 : data?.probability ? data.probability + 1 : 0
        }
        disabledReason={
          hasCurrentProbability ? RESIDUAL_BLOCKED_REASON : undefined
        }
      />
      {showSuggestionHint && (
        <SText
          fontSize={11}
          color="info.main"
          sx={{ cursor: 'pointer', lineHeight: 1.3, maxWidth: 160 }}
          onClick={() => handleSelect({ probabilityAfter: suggested })}
        >
          {`Sugestão pela hierarquia de controles: P${suggested}`}
        </SText>
      )}
      {!disabled && hasMissingRecType && (
        <SText
          fontSize={10}
          color="warning.main"
          sx={{ lineHeight: 1.3, maxWidth: 170 }}
        >
          {MISSING_REC_TYPE_RESIDUAL_HINT}
        </SText>
      )}
    </SFlex>
  );
};
