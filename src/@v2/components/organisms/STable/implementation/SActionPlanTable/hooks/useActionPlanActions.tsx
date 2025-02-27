import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import dynamic from 'next/dynamic';

const ActionPlanCommentsDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/ActionPlanComments/ActionPlanComments'
    );
    return mod.ActionPlanComments;
  },
  { ssr: false },
);

export const useActionPlanActions = () => {
  const { openModal } = useModal();

  const onViewComment = (actionPlan: ActionPlanBrowseResultModel) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_COMMENT_VIEW,
      <ActionPlanCommentsDynamic actionPlan={actionPlan} />,
    );
  };

  return {
    onViewComment,
  };
};
