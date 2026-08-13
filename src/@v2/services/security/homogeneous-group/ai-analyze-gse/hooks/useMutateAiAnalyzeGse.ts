import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { IErrorResp } from '@v2/types/error.type';
import { isAiAnalyzeRequestCanceled } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/is-ai-analyze-request-canceled.util';

import { aiAnalyzeGse } from '../service/ai-analyze-gse.service';

export const useMutateAiAnalyzeGse = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: aiAnalyzeGse,
    invalidateQueryKey: false,
    onSuccess: () => onSuccessMessage('Análise de IA realizada com sucesso'),
    onError: (error: unknown) => {
      if (isAiAnalyzeRequestCanceled(error)) return;
      onErrorMessage(error as unknown as IErrorResp);
    },
  });
};
