import { QueryKeyStatusEnum } from '@v2/constants/enums/status-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { deleteStatus } from '../service/delete-status.service';

export const useMutateDeleteStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyStatusEnum.STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status deletedo com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
