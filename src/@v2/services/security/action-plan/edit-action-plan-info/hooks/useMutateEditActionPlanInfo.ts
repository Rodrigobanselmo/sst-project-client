import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editActionPlanInfo } from '../service/edit-action-plan-info.service';

export const useMutateEditActionPlanInfo = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editActionPlanInfo,
    invalidateQueryKey: (_, variables) => [
      QueryKeyEnum.ACTION_PLAN_INFO,
      variables.companyId,
      variables.workspaceId,
    ],
    onSuccess: () => onSuccessMessage('Dados editados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
