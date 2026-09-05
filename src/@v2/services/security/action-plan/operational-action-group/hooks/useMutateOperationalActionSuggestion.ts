import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  confirmOperationalActionSuggestion,
  dismissOperationalActionSuggestion,
} from '../service/operational-action-group.service';

export const useMutateConfirmOperationalActionSuggestion = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: confirmOperationalActionSuggestion,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyActionPlanEnum.ACTION_PLAN, variables.viewingCompanyId],
      [QueryKeyActionPlanEnum.ACTION_OPERATIONAL_SUGGESTIONS],
    ],
    onSuccess: () => onSuccessMessage('Equivalência operacional confirmada'),
    onError: onErrorMessage,
  });
};

export const useMutateDismissOperationalActionSuggestion = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: dismissOperationalActionSuggestion,
    invalidateManyQueryKeys: () => [
      [QueryKeyActionPlanEnum.ACTION_OPERATIONAL_SUGGESTIONS],
    ],
    onSuccess: () => onSuccessMessage('Sugestão ignorada'),
    onError: onErrorMessage,
  });
};
