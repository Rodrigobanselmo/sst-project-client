import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editActionPlanEffectiveness } from '../service/edit-action-plan-effectiveness.service';

export const useMutateEditActionPlanEffectiveness = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editActionPlanEffectiveness,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyActionPlanEnum.ACTION_PLAN, variables.companyId],
    ],
    onSuccess: () => onSuccessMessage('Eficácia registrada com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
