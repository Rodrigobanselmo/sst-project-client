import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { editManyCharacterization } from '../service/edit-many-characterization.service';

export const useMutateEditManyCharacterization = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editManyCharacterization,
    invalidateManyQueryKeys: (_, variables) => [
      [
        QueryKeyCharacterizationEnum.CHARACTERIZATIONS,
        variables.companyId,
        variables.workspaceId,
      ],
    ],
    onSuccess: () => onSuccessMessage('Dados editados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
