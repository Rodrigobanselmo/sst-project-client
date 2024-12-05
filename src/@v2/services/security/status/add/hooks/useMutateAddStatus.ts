import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addStatus } from '../service/add-status.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';

export const useMutateAddStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyCharacterizationEnum.CHARACTERIZATIONS_STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
