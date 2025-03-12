import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addActionPlanPhoto } from '../service/add-action-plan-photo.service';

export const useMutateAddActionPlanPhoto = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addActionPlanPhoto,
    invalidateQueryKey: (_, variables) => [
      QueryKeyActionPlanEnum.ACTION_PLAN_PHOTO,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Dados adicionados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
