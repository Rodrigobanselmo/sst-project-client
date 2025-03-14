import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { deleteActionPlanPhoto } from '../service/delete-action-plan-photo.service';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useMutateDeleteActionPlanPhoto = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteActionPlanPhoto,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyActionPlanEnum.ACTION_PLAN_PHOTO, variables.companyId],
      [
        QueryKeyActionPlanEnum.ACTION_PLAN,
        variables.companyId,
        QueryKeyEnum.READ,
      ],
    ],
    onSuccess: () => onSuccessMessage('Dados deleteados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
