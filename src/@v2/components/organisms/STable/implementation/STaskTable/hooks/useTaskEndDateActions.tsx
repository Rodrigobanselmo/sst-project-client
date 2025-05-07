import { useMutateEditManyTask } from '@v2/services/tasks/task/edit-many-task/hooks/useMutateEditManyTask';
import { useMutateEditTask } from '@v2/services/tasks/task/edit-task/hooks/useMutateEditTask';

export interface IEditTaskEndDateParams {
  id: number;
  endDate: Date | null;
}

export interface IEditManyTaskEndDateParams {
  ids: number[];
  endDate: Date | null;
}

export const useTaskEndDateActions = ({ companyId }: { companyId: string }) => {
  const editTask = useMutateEditTask();
  const editManyTask = useMutateEditManyTask();

  const onEditTaskEndDate = (data: IEditTaskEndDateParams) => {
    editTask.mutateAsync({
      companyId,
      id: data.id,
      endDate: data.endDate,
    });
  };

  const onEditManyTaskEndDate = (data: IEditManyTaskEndDateParams) => {
    editManyTask.mutateAsync({
      companyId,
      ids: data.ids,
      endDate: data.endDate,
    });
  };

  return {
    onEditTaskEndDate,
    onEditManyTaskEndDate,
    isLoading: editTask.isPending || editManyTask.isPending,
  };
};
