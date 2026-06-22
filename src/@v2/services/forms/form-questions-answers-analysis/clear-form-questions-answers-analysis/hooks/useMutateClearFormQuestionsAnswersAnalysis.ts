import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { clearFormQuestionsAnswersAnalysis } from '../service/clear-form-questions-answers-analysis.service';

export const useMutateClearFormQuestionsAnswersAnalysis = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: clearFormQuestionsAnswersAnalysis,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
      variables.companyId,
      variables.applicationId,
    ],
    onError: onErrorMessage,
    onSuccess: (data) => {
      if (data.dryRun) return;

      onSuccessMessage(
        data.deletedCount === 1
          ? '1 análise de IA removida.'
          : `${data.deletedCount} análises de IA removidas.`,
      );
    },
  });

  return mutate;
};
