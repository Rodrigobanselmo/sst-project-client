import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { aiAnalyzeFormQuestionsRisks } from '../service/ai-analyze-risks.service';

export const useMutateAiAnalyzeFormQuestionsRisks = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: aiAnalyzeFormQuestionsRisks,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
      variables.companyId,
      variables.formApplicationId,
    ],
    onSuccess: () => onSuccessMessage('Análise de IA iniciada com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
