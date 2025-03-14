import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addActionPlanPhoto } from '../service/add-action-plan-photo.service';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useMutateAddActionPlanPhoto = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addActionPlanPhoto,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyActionPlanEnum.ACTION_PLAN_PHOTO, variables.companyId],
      [
        QueryKeyActionPlanEnum.ACTION_PLAN,
        variables.companyId,
        QueryKeyEnum.READ,
      ],
    ],
    onSuccess: () => onSuccessMessage('Dados adicionados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
