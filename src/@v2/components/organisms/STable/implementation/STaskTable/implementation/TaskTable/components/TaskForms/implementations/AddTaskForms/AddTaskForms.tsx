import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { useTasksResponsibleActions } from '@v2/components/organisms/STable/implementation/STaskTable/hooks/useTasksResponsibleActions';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useMutateAddTask } from '@v2/services/tasks/task/add-task/hooks/useMutateAddTask';
import { useForm } from 'react-hook-form';
import {
  addTaskFormsInitialValues,
  IAddTaskFormsFields,
  schemaAddTaskForms,
} from './AddTaskForms.schema';
import { FormAddTask } from './components/FormAddTask';
import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';

interface Props {
  companyId: string;
  projectId?: number;
  actionPlan?: {
    workspaceId: string;
    recommendationId: string;
    riskDataId: string;
  };
}

export const AddTaskForms = ({ companyId, projectId, actionPlan }: Props) => {
  const addMutate = useMutateAddTask();
  const { closeModal } = useModal();
  const { onAddResponsible } = useTasksResponsibleActions({ companyId });

  const form = useForm({
    resolver: yupResolver(schemaAddTaskForms),
    defaultValues: addTaskFormsInitialValues,
  });

  const onSubmit = async (data: IAddTaskFormsFields) => {
    const onSubmit = (userId?: number) => {
      addMutate
        .mutateAsync({
          companyId,
          description: data.description,
          priority: data.priority?.value,
          endDate: data.endDate,
          statusId: data.status?.id,
          actionPlan: actionPlan,
          projectId,
          responsible: userId ? [{ userId }] : [],
          photos: [],
        })
        .then(() => {
          closeModal(ModalKeyEnum.TASK_ADD);
        });
    };

    if (data.responsible?.employeeId) {
      onAddResponsible({
        onSubmit,
        responsible: new ResponsibleBrowseResultModel({
          email: data.responsible.email,
          employeeId: data.responsible.employeeId,
          userId: data.responsible.id,
          name: data.responsible.name,
        }),
      });
    } else {
      onSubmit(data.responsible?.id);
    }
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.TASK_ADD}
      title="Tarefa"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormAddTask companyId={companyId} />
      </SForm>
    </SModalWrapper>
  );
};
