import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  acceptFormQuestionsAnswersAnalysisItem,
  commentFormQuestionsAnswersAnalysisItem,
} from '../service/review-form-questions-answers-analysis-item.service';

const invalidateAnalysis = (_: unknown, variables: { companyId: string; applicationId: string }) => [
  QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_ANALYSIS,
  variables.companyId,
  variables.applicationId,
];

export const useMutateAcceptFormQuestionsAnswersAnalysisItem = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: acceptFormQuestionsAnswersAnalysisItem,
    invalidateQueryKey: invalidateAnalysis,
    onSuccess: () => onSuccessMessage('Aceite registrado'),
    onError: onErrorMessage,
  });
};

export const useMutateCommentFormQuestionsAnswersAnalysisItem = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: commentFormQuestionsAnswersAnalysisItem,
    invalidateQueryKey: invalidateAnalysis,
    onSuccess: () => onSuccessMessage('Comentário adicionado'),
    onError: onErrorMessage,
  });
};
