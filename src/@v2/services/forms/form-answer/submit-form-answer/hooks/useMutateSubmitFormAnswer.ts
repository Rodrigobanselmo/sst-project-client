import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { submitFormAnswer } from '../service/submit-form-answer.service';

export const useMutateSubmitFormAnswer = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: submitFormAnswer,
    invalidateManyQueryKeys: () => [],
    onSuccess: () => onSuccessMessage('Resposta enviada com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
