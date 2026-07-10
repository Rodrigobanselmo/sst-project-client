import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { IErrorResp } from '@v2/types/error.type';
import { aiAnalyzeCharacterization } from '../service/ai-analyze-characterization.service';
import { isAiAnalyzeRequestCanceled } from '../service/is-ai-analyze-request-canceled.util';

export const useMutateAiAnalyzeCharacterization = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: aiAnalyzeCharacterization,
    invalidateQueryKey: false,
    onSuccess: () => onSuccessMessage('Análise de IA realizada com sucesso'),
    onError: (error: unknown) => {
      if (isAiAnalyzeRequestCanceled(error)) return;
      onErrorMessage(error as unknown as IErrorResp);
    },
  });

  return mutate;
};
