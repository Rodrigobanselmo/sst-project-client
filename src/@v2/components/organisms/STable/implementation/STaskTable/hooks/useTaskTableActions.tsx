import { useModal } from '@v2/hooks/useModal';
import { TaskBrowseResultModel } from '@v2/models/tasks/models/task/task-browse-result.model';
import { useMutateEditManyTask } from '@v2/services/tasks/task/edit-many-task/hooks/useMutateEditManyTask';
import { EditManyTaskParams } from '@v2/services/tasks/task/edit-many-task/service/edit-many-task.service';
import { useMutateEditTask } from '@v2/services/tasks/task/edit-task/hooks/useMutateEditTask';
import { EditTaskParams } from '@v2/services/tasks/task/edit-task/service/edit-task.service';
import { useTaskFormActions } from '../implementation/TaskTable/components/TaskForms/hooks/useTaskFormActions';

export const useTaskTableActions = ({ companyId }: { companyId: string }) => {
  const editTask = useMutateEditTask();
  const editManyTask = useMutateEditManyTask();
  const { onTaskEdit } = useTaskFormActions();

  const onSelectRow = (task: TaskBrowseResultModel) => {
    onTaskEdit({ companyId, id: task.id });
  };

  const handleTaskEdit = async ({
    id,
    statusId,
  }: Pick<EditTaskParams, 'id' | 'statusId'>) => {
    await editTask.mutateAsync({ id, statusId, companyId });
  };

  const handleTaskEditMany = async ({
    ids,
    statusId,
  }: Pick<EditManyTaskParams, 'ids' | 'statusId'>) => {
    await editManyTask.mutateAsync({ ids, companyId, statusId });
  };

  return {
    onSelectRow,
    handleTaskEdit,
    handleTaskEditMany,
  };
};
