import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { generateRiskNarrativeDiagnostic } from '../service/risk-narrative-diagnostic.service';

export const getRiskNarrativeDiagnosticQueryKey = (
  companyId: string,
  formApplicationId: string,
) => ['form-risk-narrative-diagnostic', companyId, formApplicationId] as const;

export const useMutateGenerateRiskNarrativeDiagnostic = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: generateRiskNarrativeDiagnostic,
    invalidateQueryKey: (_, variables) => [
      ...getRiskNarrativeDiagnosticQueryKey(
        variables.companyId,
        variables.formApplicationId,
      ),
    ],
    onSuccess: () =>
      onSuccessMessage('Diagnóstico narrativo iniciado. O resultado ficará disponível em instantes.'),
    onError: onErrorMessage,
  });
};
