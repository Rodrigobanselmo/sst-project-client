import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { deleteTask } from '../service/delete-task.service';
import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';

export const useMutateDeleteTask = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteTask,
    invalidateQueryKey: (_, variables) => [
      QueryKeyTaskEnum.TASK,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Item deletedo com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
