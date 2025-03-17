import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useFetchReadActionPlan } from '@v2/services/security/action-plan/action-plan/read-action-plan/hooks/useFetchReadActionPlan';
import { ActionPlanRecommendationsPhotos } from '../../../ActionPlanRecommendationsPhotos/ActionPlanRecommendationsPhotos';

export interface IActionPlanUUIDParams {
  riskDataId: string;
  recommendationId: string;
  workspaceId: string;
  companyId: string;
}

export const ActionPlanCommentPhotos = ({
  uuid,
}: {
  uuid: IActionPlanUUIDParams;
}) => {
  const { actionPlan, isLoading } = useFetchReadActionPlan({
    companyId: uuid.companyId,
    recommendationId: uuid.recommendationId,
    riskDataId: uuid.riskDataId,
    workspaceId: uuid.workspaceId,
  });

  return (
    <>
      {isLoading || !actionPlan ? (
        <SSkeleton height={30} width={300} />
      ) : (
        <ActionPlanRecommendationsPhotos
          boxProps={{ mt: 16, mb: 0 }}
          actionPlan={actionPlan}
        />
      )}
    </>
  );
};
