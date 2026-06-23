import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { recoverStuckFormQuestionsAnswersAnalysis } from '../service/recover-stuck-form-questions-answers-analysis.service';

export const useMutateRecoverStuckFormQuestionsAnswersAnalysis = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: recoverStuckFormQuestionsAnswersAnalysis,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
      variables.companyId,
      variables.applicationId,
    ],
    onError: onErrorMessage,
    onSuccess: (data) => {
      if (data.dryRun) return;

      onSuccessMessage(
        data.recoveredCount === 1
          ? '1 análise travada recuperada.'
          : `${data.recoveredCount} análises travadas recuperadas.`,
      );
    },
  });

  return mutate;
};
