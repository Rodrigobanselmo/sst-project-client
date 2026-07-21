import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { aiRiskInventorySummary } from '../service/ai-risk-inventory-summary.service';

export const useMutateAiRiskInventorySummary = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: aiRiskInventorySummary,
    invalidateManyQueryKeys: () => [],
    onSuccess: () => onSuccessMessage('Resumo gerado com IA'),
    onError: onErrorMessage,
  });
};
