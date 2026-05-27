import { useMutation, useQueryClient } from '@tanstack/react-query';
import { generateIndicatorsNarrativeDiagnostic } from '../service/indicators-narrative-diagnostic.service';
import {
  buildIndicatorsNarrativeDiagnosticScopeKey,
  normalizeIndicatorsNarrativeScope,
} from '../service/indicators-narrative-diagnostic.scope';

export const getIndicatorsNarrativeDiagnosticQueryKey = (
  companyId: string,
  formApplicationId: string,
) => ['indicators-narrative-diagnostic', companyId, formApplicationId] as const;

export const useMutateGenerateIndicatorsNarrativeDiagnostic = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateIndicatorsNarrativeDiagnostic,
    onSuccess: (data, variables) => {
      const normalizedScope = normalizeIndicatorsNarrativeScope(variables.scope);
      const scopeKey = buildIndicatorsNarrativeDiagnosticScopeKey(normalizedScope);
      void queryClient.setQueryData(
        [
          ...getIndicatorsNarrativeDiagnosticQueryKey(
            variables.companyId,
            variables.formApplicationId,
          ),
          scopeKey,
        ],
        data,
      );

      void queryClient.invalidateQueries({
        queryKey: getIndicatorsNarrativeDiagnosticQueryKey(
          variables.companyId,
          variables.formApplicationId,
        ),
      });
    },
  });
};
