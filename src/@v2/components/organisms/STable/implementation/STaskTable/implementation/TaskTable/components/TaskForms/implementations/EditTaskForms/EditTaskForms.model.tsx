import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useFetchReadTask } from '@v2/services/tasks/task/read-task/hooks/useMutateReadTask';
import { useRef } from 'react';
import { EditTaskForms } from './EditTaskForms';
import { useMutateDeleteTask } from '@v2/services/tasks/task/delete-task/hooks/useMutateDeleteTask';

interface Props {
  companyId: string;
  id: number;
}

export const EditTaskFormsModel = ({ companyId, id }: Props) => {
  const { closeModal } = useModal();
  const formRef = useRef<{ onSubmit: () => void }>(null);

  const deleteMutate = useMutateDeleteTask();
  const { task, isLoading } = useFetchReadTask({
    companyId,
    id,
  });

  const onClose = () => {
    closeModal(ModalKeyEnum.TASK_EDIT);
  };

  const onDelete = async () => {
    await deleteMutate.mutateAsync({
      companyId,
      id,
    });
    closeModal(ModalKeyEnum.TASK_EDIT);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.TASK_EDIT}
      title="Tarefa"
      minWidthDesk={600}
      onSubmit={() => formRef.current?.onSubmit()}
      dangerButtonOptions={{
        onClick: onDelete,
      }}
    >
      {isLoading || !task ? (
        <SSkeleton height={30} width={300} />
      ) : (
        <EditTaskForms formRef={formRef} task={task} onClose={onClose} />
      )}
    </SModalWrapper>
  );
};
