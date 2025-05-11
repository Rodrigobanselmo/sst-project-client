import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addTask } from '../service/add-task.service';
import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';
import { QueryKeyTaskEnum } from '@v2/constants/enums/task-query-key.enum';
import { QueryKeyEnum } from '@v2/constants/enums/@query-key.enum';

export const useMutateAddTask = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addTask,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyTaskEnum.TASK, variables.companyId],
      [
        QueryKeyActionPlanEnum.ACTION_PLAN,
        variables.companyId,
        QueryKeyEnum.READ,
      ],
    ],
    onSuccess: () => onSuccessMessage('Item adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
