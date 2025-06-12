import { Box } from '@mui/material';
import { SDivider } from '@v2/components/atoms/SDivider/SDivider';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SText } from '@v2/components/atoms/SText/SText';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum } from '@v2/hooks/useModal';
import { useFetchReadActionPlan } from '@v2/services/security/action-plan/action-plan/read-action-plan/hooks/useFetchReadActionPlan';
import { ActionPlanSubTasks } from './components/ActionPlanSubTasks';
import { ActionPlanRecommendationsPhotos } from '../ActionPlanRecommendationsPhotos/ActionPlanRecommendationsPhotos';
import { ActionPlanCharacterizationPhotos } from '../ActionPlanCharacterizationPhotos/ActionPlanCharacterizationPhotos';

export const ActionPlanViewModal = ({
  companyId,
  recommendationId,
  riskDataId,
  workspaceId,
}: {
  companyId: string;
  recommendationId: string;
  riskDataId: string;
  workspaceId: string;
}) => {
  const { actionPlan, isLoading } = useFetchReadActionPlan({
    companyId,
    recommendationId,
    riskDataId,
    workspaceId,
  });

  const title = actionPlan?.name
    ? `${actionPlan.name} (${actionPlan.originType})`
    : 'carregando...';

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_VIEW}
      title={title}
      semiFullScreen
      closeButtonOptions={{
        text: 'Fechar',
      }}
    >
      {isLoading || !actionPlan ? (
        <SSkeleton height={30} width={300} />
      ) : (
        <Box display="flex" flex={1} flexDirection="column">
          <SText color="grey.600" fontSize={18}>
            Recomendação
          </SText>
          <SDivider sx={{ mt: 3, mb: 6 }} />
          <SText mb={10} fontSize={16}>
            {actionPlan.recommendation.name}
          </SText>
          <ActionPlanSubTasks
            actionPlan={actionPlan}
            boxProps={{ mt: 4, mb: 20 }}
          />
          <ActionPlanRecommendationsPhotos actionPlan={actionPlan} />
          <ActionPlanCharacterizationPhotos actionPlan={actionPlan} />
        </Box>
      )}
    </SModalWrapper>
  );
};
