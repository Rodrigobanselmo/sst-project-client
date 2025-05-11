import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editManyPhotoRecommendation } from '../service/edit-many-photo-recommendation.service';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useMutateEditManyPhotoRecommendation = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editManyPhotoRecommendation,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyCharacterizationEnum.PHOTO_RECOMMENDATION, variables.companyId],
      [
        QueryKeyActionPlanEnum.ACTION_PLAN,
        variables.companyId,
        QueryKeyEnum.READ,
      ],
    ],
    onSuccess: () => onSuccessMessage('Dados editados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
