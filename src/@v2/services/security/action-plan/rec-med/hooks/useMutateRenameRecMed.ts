import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { renameRecMed } from '../service/rename-rec-med.service';

export const useMutateRenameRecMed = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: renameRecMed,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyActionPlanEnum.ACTION_PLAN, variables.companyId],
      [QueryKeyActionPlanEnum.ACTION_OPERATIONAL_SUGGESTIONS],
    ],
    onSuccess: () => onSuccessMessage('Texto da recomendação atualizado'),
    onError: onErrorMessage,
  });
};
