import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editFormQuestionsAnswersAnalysis } from '../service/edit-form-questions-answers-analysis.service';

export const useMutateEditFormQuestionsAnswersAnalysis = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editFormQuestionsAnswersAnalysis,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
      variables.companyId,
      variables.applicationId,
    ],
    onSuccess: () => onSuccessMessage('Análise editada com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
