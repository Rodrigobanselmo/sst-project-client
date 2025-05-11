import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editTask } from '../service/edit-task.service';

export const useMutateEditTask = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editTask,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyTaskEnum.TASK, variables.companyId],
    ],
    onSuccess: () => onSuccessMessage('Item editado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
