import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { upsertSystemAiPrompt } from '../service/system-ai-prompt.service';

export const useMutateUpsertSystemAiPrompt = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: upsertSystemAiPrompt,
    invalidateQueryKey: (_, variables) => ['system-ai-prompt', variables.key],
    onSuccess: () =>
      onSuccessMessage('Prompt padrão do sistema atualizado com sucesso'),
    onError: onErrorMessage,
  });
};
