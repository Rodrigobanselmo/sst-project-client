import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editActionPlan } from '../service/edit-action-plan.service';

export const useMutateEditActionPlan = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editActionPlan,
    invalidateQueryKey: (_, variables) => [
      QueryKeyActionPlanEnum.ACTION_PLAN,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Dados editados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
