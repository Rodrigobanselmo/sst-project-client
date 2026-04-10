import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  createFormPreliminaryLibraryQuestion,
  CreateFormPreliminaryLibraryQuestionParams,
} from '../service/create-form-preliminary-library-question.service';

export function useCreateFormPreliminaryLibraryQuestion() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: (params: CreateFormPreliminaryLibraryQuestionParams) =>
      createFormPreliminaryLibraryQuestion(params),
    invalidateQueryKey: [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_QUESTIONS],
    onSuccess: () =>
      onSuccessMessage('Pergunta da biblioteca criada com sucesso!'),
    onError: onErrorMessage,
  });
}
