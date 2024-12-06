import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editManyComments } from '../service/edit-many-action-plan.service';

export const useMutateEditManyComments = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editManyComments,
    invalidateQueryKey: (_, variables) => [
      QueryKeyActionPlanEnum.ACTION_PLAN_COMMENT,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Dados editados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
