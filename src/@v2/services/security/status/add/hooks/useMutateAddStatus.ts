import { QueryKeyStatusEnum } from '@v2/constants/enums/status-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addStatus } from '../service/add-status.service';

export const useMutateAddStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyStatusEnum.STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
