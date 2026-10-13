import React, { FC, useEffect, useMemo, useRef } from 'react';

import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import {
  calculateSuggestedResidualProbability,
  decideResidualAutoApply,
  isResidualRowResolvedForWorkspace,
  ResidualAutoApplyTracking,
  residualTrackingContextKey,
} from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/calculateSuggestedResidualProbability.util';
import { residualSuggestionMessage } from 'components/organisms/main/Tree/OrgTree/components/RiskTool/utils/residualSuggestionMessage.util';
import { useTabWorkspaceId } from 'core/hooks/useTabWorkspaceId';
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

  const { workspaceId: headerWorkspaceId } = useTabWorkspaceId();
  const contextKey = residualTrackingContextKey({
    riskDataId: data?.id,
    workspaceId: headerWorkspaceId,
  });
  const trackingRef = useRef<ResidualAutoApplyTracking | null>(null);

  const resolvedForWorkspace = isResidualRowResolvedForWorkspace({
    headerWorkspaceId,
    riskData: data,
  });

  useEffect(() => {
    if (!resolvedForWorkspace) {
      trackingRef.current = null;
      return;
    }
    const decision = decideResidualAutoApply({
      previous: trackingRef.current,
      contextKey,
      signature: recSignature,
      realProbability: data?.probability,
      currentResidual: data?.probabilityAfter,
      suggested,
    });
    trackingRef.current = decision.tracking;
    if (decision.apply == null) return;

    handleSelect({
      probabilityAfter: decision.apply,
    });
    // handleSelect é recriado a cada render no RiskTool; não incluir nas deps.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    contextKey,
    recSignature,
    data?.probability,
    data?.probabilityAfter,
    resolvedForWorkspace,
    suggested,
  ]);

  const suggestionMessage = residualSuggestionMessage({
    hasRecommendations: !disabled,
    residual: data?.probabilityAfter,
    suggested,
  });

  const hasMissingRecType = useMemo(
    () => (data?.recs ?? []).some((rec) => isRecommendationRecTypeMissing(rec?.recType)),
    [data?.recs],
  );

  return (
    <SFlex direction="column" gap={2} alignItems="flex-start">
      <SelectedNumber
        handleSelect={(number) =>
          handleSelect({
            probabilityAfter: number,
          })
        }
        selectedNumber={data?.probabilityAfter}
        disabledGtEqual={
          disabled ? 0 : data?.probability ? data.probability + 1 : 0
        }
        disabledReason={
          hasCurrentProbability ? RESIDUAL_BLOCKED_REASON : undefined
        }
      />
      {suggestionMessage && (
        <SText
          fontSize={11}
          color={suggestionMessage.color}
          sx={{
            cursor: suggestionMessage.canApplySuggestion ? 'pointer' : 'default',
            lineHeight: 1.3,
            maxWidth: 170,
          }}
          onClick={
            suggestionMessage.canApplySuggestion && suggested != null
              ? () =>
                  handleSelect({
                    probabilityAfter: suggested,
                  })
              : undefined
          }
        >
          {suggestionMessage.text}
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
