import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateConsolidatedRiskNarrativeDiagnostic } from '../service/consolidated-view-risk-narrative.service';
import {
  buildConsolidatedRiskNarrativeScopeKey,
  normalizeConsolidatedRiskNarrativeScope,
} from '../service/consolidated-view-risk-narrative.scope';

export const getConsolidatedRiskNarrativeDiagnosticQueryKey = (
  companyGroupId: number,
  applicationIds?: string[],
) =>
  [
    'consolidated-risk-narrative-diagnostic',
    companyGroupId,
    ...(applicationIds?.length ? [applicationIds.slice().sort().join('|')] : []),
  ] as const;

export const useMutateGenerateConsolidatedViewRiskNarrativeDiagnostic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateConsolidatedRiskNarrativeDiagnostic,
    onSuccess: (data, variables) => {
      const normalizedScope = normalizeConsolidatedRiskNarrativeScope(variables.scope);
      const scopeKey = buildConsolidatedRiskNarrativeScopeKey(normalizedScope, {
        companyGroupId: variables.companyGroupId,
        applicationIds: variables.applicationIds ?? [],
      });

      void queryClient.setQueryData(
        [
          ...getConsolidatedRiskNarrativeDiagnosticQueryKey(
            variables.companyGroupId,
            variables.applicationIds,
          ),
          scopeKey,
        ],
        data,
      );

      void queryClient.invalidateQueries({
        queryKey: getConsolidatedRiskNarrativeDiagnosticQueryKey(
          variables.companyGroupId,
          variables.applicationIds,
        ),
      });
    },
  });
};
