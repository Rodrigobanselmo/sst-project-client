import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  deleteFormPreliminaryLibraryQuestion,
  DeleteFormPreliminaryLibraryQuestionParams,
} from '../service/delete-form-preliminary-library-question.service';

export function useDeleteFormPreliminaryLibraryQuestion() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: (params: DeleteFormPreliminaryLibraryQuestionParams) =>
      deleteFormPreliminaryLibraryQuestion(params),
    invalidateManyQueryKeys: [
      [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_QUESTIONS],
      [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_BLOCKS],
    ],
    onSuccess: () => onSuccessMessage('Pergunta da biblioteca excluída com sucesso.'),
    onError: onErrorMessage,
  });
}
