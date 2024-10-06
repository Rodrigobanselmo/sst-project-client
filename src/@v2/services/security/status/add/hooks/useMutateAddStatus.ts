import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addStatus } from '../service/add-status.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';

export const useMutateAddStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyEnum.STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
