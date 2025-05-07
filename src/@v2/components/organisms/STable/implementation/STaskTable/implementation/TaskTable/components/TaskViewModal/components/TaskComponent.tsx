import { Box, BoxProps } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { TaskReadModel } from '@v2/models/tasks/models/task/task-read.model';

interface Props {
  task: TaskReadModel;
  boxProps?: BoxProps;
}

export const TaskComponent = ({ task, boxProps }: Props) => {
  return (
    <Box mb={16} {...boxProps}>
      <SFlex justify="space-between">
        <SText color="grey.600" fontSize={18}>
          Tarefas
        </SText>
        <SButton color="success" text="Adicionar Tarefa" />
      </SFlex>
      <SDivider sx={{ mt: 3, mb: 8 }} />
    </Box>
  );
};
