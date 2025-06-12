import { Box, BoxProps } from '@mui/material';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { TasksActionPlanTable } from '@v2/components/organisms/STable/implementation/STaskTable/implementation/TaskTable/TasksActionPlanTable';
import { useTaskFormActions } from '@v2/components/organisms/STable/implementation/STaskTable/implementation/TaskTable/components/TaskForms/hooks/useTaskFormActions';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { useMutateAddTask } from '@v2/services/tasks/task/add-task/hooks/useMutateAddTask';

const limit = 15;

export const ActionPlanSubTasks = ({
  actionPlan,
  boxProps,
}: {
  actionPlan: ActionPlanReadModel;
  boxProps?: BoxProps;
}) => {
  const companyId = actionPlan.companyId;
  const recommendationId = actionPlan.uuid.recommendationId;
  const riskDataId = actionPlan.uuid.riskDataId;
  const workspaceId = actionPlan.uuid.workspaceId;

  const addTask = useMutateAddTask();
  // const deleteTask = useMutateDeleteTask();

  const { onTaskAdd } = useTaskFormActions();

  return (
    <Box {...boxProps}>
      <SFlex justify="space-between">
        <SText color="grey.600" fontSize={18}>
          Tarefas
        </SText>
        <SButton
          color="success"
          text="Adicionar Tarefa"
          onClick={() =>
            onTaskAdd({
              companyId,
              actionPlan: {
                recommendationId,
                riskDataId,
                workspaceId,
              },
            })
          }
        />
      </SFlex>
      <SDivider sx={{ mt: 3, mb: 8 }} />
      <TasksActionPlanTable
        companyId={companyId}
        actionPlanId={actionPlan.uuid.id}
      />
    </Box>
  );
};
