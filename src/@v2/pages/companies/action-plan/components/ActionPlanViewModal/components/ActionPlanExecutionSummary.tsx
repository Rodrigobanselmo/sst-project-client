import { Box } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { ActionPlanReadModel } from '@v2/models/security/models/action-plan/action-plan-read.model';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import { dateUtils } from '@v2/utils/date-utils';

export const ActionPlanExecutionSummary = ({
  actionPlan,
}: {
  actionPlan: ActionPlanReadModel;
}) => {
  return (
    <Box mt={8} mb={4}>
      <SText color="grey.600" fontSize={18}>
        Execução
      </SText>
      <SDivider sx={{ mt: 3, mb: 6 }} />
      <SText fontSize={15} mb={3}>
        Status:{' '}
        {ActionPlanStatusTypeTranslate[actionPlan.status] ?? actionPlan.status}
      </SText>
      <SText fontSize={15} mb={3}>
        Prazo:{' '}
        {actionPlan.validDate
          ? dateUtils(actionPlan.validDate).format('DD/MM/YYYY')
          : 'Sem prazo'}
      </SText>
      <SText fontSize={15} mb={3}>
        Responsável: {actionPlan.responsible?.name || 'Não definido'}
      </SText>
      <SText fontSize={15}>
        Trabalhadores expostos: {actionPlan.exposedWorkersCount}
      </SText>
    </Box>
  );
};
