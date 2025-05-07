import { useAppRouter } from '@v2/hooks/useAppRouter';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { TaskReadModel } from '@v2/models/tasks/models/task/task-read.model';
import dynamic from 'next/dynamic';

const FormAddDynamic = dynamic(
  async () => {
    const mod = await import('../implementations/AddTaskForms/AddTaskForms');
    return mod.AddTaskForms;
  },
  { ssr: false },
);

const FormEditDynamic = dynamic(
  async () => {
    const mod = await import(
      '../implementations/EditTaskForms/EditTaskForms.model'
    );
    return mod.EditTaskFormsModel;
  },
  { ssr: false },
);

export const useTaskFormActions = () => {
  const { openModal } = useModal();
  const router = useAppRouter();

  const onTaskEdit = ({ companyId, id }: { id: number; companyId: string }) => {
    openModal(
      ModalKeyEnum.TASK_EDIT,
      <FormEditDynamic companyId={companyId} id={id} />,
    );
  };

  const onTaskAdd = ({
    companyId,
    projectId,
    actionPlan,
  }: {
    companyId: string;
    projectId?: number;
    actionPlan?: {
      workspaceId: string;
      recommendationId: string;
      riskDataId: string;
    };
  }) => {
    openModal(
      ModalKeyEnum.TASK_ADD,
      <FormAddDynamic
        companyId={companyId}
        actionPlan={actionPlan}
        projectId={projectId}
      />,
    );
  };

  return { onTaskAdd, onTaskEdit };
};
