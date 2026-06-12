import { useMutation, useQueryClient } from '@tanstack/react-query';

import { generateConsolidatedIndicatorsNarrativeDiagnostic } from '../service/consolidated-view-narrative.service';
import {
  buildConsolidatedIndicatorsNarrativeScopeKey,
  normalizeConsolidatedIndicatorsNarrativeScope,
} from '../service/consolidated-view-narrative.scope';

export const getConsolidatedIndicatorsNarrativeDiagnosticQueryKey = (
  companyGroupId: number,
  applicationIds?: string[],
) =>
  [
    'consolidated-indicators-narrative-diagnostic',
    companyGroupId,
    ...(applicationIds?.length ? [applicationIds.slice().sort().join('|')] : []),
  ] as const;

export const useMutateGenerateConsolidatedViewIndicatorsNarrativeDiagnostic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateConsolidatedIndicatorsNarrativeDiagnostic,
    onSuccess: (data, variables) => {
      const normalizedScope = normalizeConsolidatedIndicatorsNarrativeScope(variables.scope);
      const scopeKey = buildConsolidatedIndicatorsNarrativeScopeKey(normalizedScope, {
        companyGroupId: variables.companyGroupId,
        applicationIds: variables.applicationIds ?? [],
      });

      void queryClient.setQueryData(
        [
          ...getConsolidatedIndicatorsNarrativeDiagnosticQueryKey(
            variables.companyGroupId,
            variables.applicationIds,
          ),
          scopeKey,
        ],
        data,
      );

      void queryClient.invalidateQueries({
        queryKey: getConsolidatedIndicatorsNarrativeDiagnosticQueryKey(
          variables.companyGroupId,
          variables.applicationIds,
        ),
      });
    },
  });
};
