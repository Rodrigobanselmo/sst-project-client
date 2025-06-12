import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import { CommentBrowseResultModel } from '@v2/models/security/models/comment/comment-browse-result.model';
import dynamic from 'next/dynamic';

const ActionPlanViewModalDynamic = dynamic(
  async () => {
    const mod = await import('../../ActionPlanViewModal/ActionPlanViewModal');
    return mod.ActionPlanViewModal;
  },
  { ssr: false },
);

export const useCommentsActions = ({ companyId }: { companyId: string }) => {
  const { openModal } = useModal();

  const onSelectRow = (actionPlan: CommentBrowseResultModel) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_VIEW,
      <ActionPlanViewModalDynamic
        companyId={companyId}
        recommendationId={actionPlan.recommendation.id}
        riskDataId={actionPlan.riskDataId}
        workspaceId={actionPlan.workspaceId}
      />,
    );
  };

  return {
    onSelectRow,
  };
};
