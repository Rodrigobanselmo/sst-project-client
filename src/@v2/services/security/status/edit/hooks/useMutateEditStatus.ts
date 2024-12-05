import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editStatus } from '../service/edit-status.service';

export const useMutateEditStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyCharacterizationEnum.CHARACTERIZATIONS_STATUS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Status editado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
