import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editManyTask } from '../service/edit-many-task.service';
import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';

export const useMutateEditManyTask = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editManyTask,
    invalidateQueryKey: (_, variables) => [
      QueryKeyTaskEnum.TASK,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Items editados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
