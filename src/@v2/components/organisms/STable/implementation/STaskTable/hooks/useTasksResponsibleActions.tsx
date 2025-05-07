import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';
import { TaskResponsibleBrowseResultModel } from '@v2/models/tasks/models/responsible/task-responsible-browse-result.model';
import { useMutateEditManyTask } from '@v2/services/tasks/task/edit-many-task/hooks/useMutateEditManyTask';
import { useMutateEditTask } from '@v2/services/tasks/task/edit-task/hooks/useMutateEditTask';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

export interface IEditTaskResponsibleParams
  extends ResponsibleBrowseResultModel {
  id: number;
}

export interface IEditManyTaskResponsibleParams
  extends ResponsibleBrowseResultModel {
  ids: number[];
}

export interface IAddResponsibleParams {
  responsible: TaskResponsibleBrowseResultModel;
  onSubmit: (userId: number, data: ResponsibleBrowseResultModel | null) => void;
}

export const useTasksResponsibleActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { onStackOpenModal } = useModal();
  const editTask = useMutateEditTask();
  const editManyTask = useMutateEditManyTask();

  const onAddResponsible = ({
    responsible,
    onSubmit,
  }: IAddResponsibleParams) => {
    //! old code
    if (responsible.employeeId) {
      onStackOpenModal(ModalEnum.USER_ADD, {
        company: { id: companyId },
        name: responsible?.name,
        email: responsible?.email,
        employeeId: responsible.employeeId,
        onSubmit: (user) => user.id && onSubmit(user.id, responsible),
      });
      return;
    }
    //! old code

    if (responsible.id) onSubmit(responsible.id, responsible);
  };

  const onEditTaskResponsible = (responsible: IEditTaskResponsibleParams) => {
    const onSubmit = (userId: number) => {
      editTask.mutateAsync({
        companyId,
        id: responsible.id,
        responsible: [{ userId }],
      });
    };

    onAddResponsible({ onSubmit, responsible });
  };

  const onEditManyTaskResponsible = (
    responsible: IEditManyTaskResponsibleParams,
  ) => {
    const onSubmit = (userId: number) => {
      editManyTask.mutateAsync({
        companyId,
        responsible: [{ userId }],
        ids: responsible.ids,
      });
    };

    onAddResponsible({ onSubmit, responsible });
  };

  return {
    onEditTaskResponsible,
    onEditManyTaskResponsible,
    onAddResponsible,
    isLoading: editTask.isPending || editManyTask.isPending,
  };
};
