import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';
import { editStatus } from '../service/edit-status.service';

export const useMutateEditStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyEnum.STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status editado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
