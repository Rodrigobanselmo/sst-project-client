import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { aiCharacterizationAssist } from '../service/ai-characterization-assist.service';

export const useMutateAiCharacterizationAssist = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: aiCharacterizationAssist,
    invalidateQueryKey: false,
    onSuccess: () =>
      onSuccessMessage('Assistente de caracterização concluído com sucesso'),
    onError: onErrorMessage,
  });
};
