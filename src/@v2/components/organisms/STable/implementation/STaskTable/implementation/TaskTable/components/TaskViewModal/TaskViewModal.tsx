import { Box } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { useFetchReadTask } from '@v2/services/tasks/task/read-task/hooks/useMutateReadTask';
import { TaskComponent } from './components/TaskComponent';

interface Props {
  companyId: string;
  id: number;
}

export const TaskViewModal = ({ companyId, id }: Props) => {
  const { task, isLoading } = useFetchReadTask({
    companyId,
    id,
  });

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.TASK_VIEW}
      title={'Visualizar Tarefa'}
      semiFullScreen
      closeButtonOptions={{
        text: 'Fechar',
      }}
    >
      {isLoading || !task ? (
        <SSkeleton height={30} width={300} />
      ) : (
        <Box display="flex" flex={1} flexDirection="column">
          <SText color="grey.600" fontSize={18}>
            Recomendação
          </SText>
          <SDivider sx={{ mt: 3, mb: 6 }} />
          <TaskComponent task={task} />
        </Box>
      )}
    </SModalWrapper>
  );
};
