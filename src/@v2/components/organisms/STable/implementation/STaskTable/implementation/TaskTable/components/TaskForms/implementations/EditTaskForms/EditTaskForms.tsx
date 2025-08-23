import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { useTasksResponsibleActions } from '@v2/components/organisms/STable/implementation/STaskTable/hooks/useTasksResponsibleActions';
import { TaskPriorityMap } from '@v2/components/organisms/STable/implementation/STaskTable/maps/task-priority-map';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';
import { TaskReadModel } from '@v2/models/tasks/models/task/task-read.model';
import { useMutateEditTask } from '@v2/services/tasks/task/edit-task/hooks/useMutateEditTask';
import { useForm } from 'react-hook-form';
import {
  IEditTaskFormFields,
  schemaEditTaskForm,
} from './EditTaskForms.schema';
import { FormEditTask } from './components/FormEditTask';
import { useImperativeHandle } from 'react';

export const EditTaskForms = ({
  task,
  onClose,
  formRef,
}: {
  task: TaskReadModel;
  onClose: () => void;
  formRef?: React.Ref<{ onSubmit: () => void }>;
}) => {
  const editMutate = useMutateEditTask();
  const { onAddResponsible } = useTasksResponsibleActions({
    companyId: task.companyId,
  });

  const form = useForm({
    resolver: yupResolver(schemaEditTaskForm),
    defaultValues: {
      description: task.description,
      endDate: task.endDate || null,
      responsible: task.responsible[0] || null,
      status: task.status || null,
      priority:
        typeof task.priority === 'number'
          ? {
              label: TaskPriorityMap[task.priority].label,
              value: task.priority,
            }
          : null,
    } satisfies IEditTaskFormFields,
  });

  const onSubmit = async (data: IEditTaskFormFields) => {
    const onSubmit = (userId?: number) => {
      editMutate
        .mutateAsync({
          companyId: task.companyId,
          id: task.id,
          description: data.description,
          priority: data.priority?.value,
          endDate: data.endDate,
          statusId: data.status?.id,
          responsible: userId ? [{ userId }] : [],
          photos: [],
        })
        .then(() => {
          onClose();
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

  useImperativeHandle(formRef, () => ({
    onSubmit: form.handleSubmit(onSubmit),
  }));

  return (
    <SForm form={form}>
      <FormEditTask companyId={task.companyId} />
    </SForm>
  );
};
