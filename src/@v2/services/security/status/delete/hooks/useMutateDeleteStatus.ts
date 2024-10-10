import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';
import { deleteStatus } from '../service/delete-status.service';

export const useMutateDeleteStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyEnum.STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status deleteado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
