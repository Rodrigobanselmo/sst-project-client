import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import dynamic from 'next/dynamic';

const ActionPlanViewModalDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/ActionPlanViewModal/ActionPlanViewModal'
    );
    return mod.ActionPlanViewModal;
  },
  { ssr: false },
);

export const useActionPlanTableActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { openModal } = useModal();

  const onSelectRow = (actionPlan: ActionPlanBrowseResultModel) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_VIEW,
      <ActionPlanViewModalDynamic
        companyId={companyId}
        recommendationId={actionPlan.uuid.recommendationId}
        riskDataId={actionPlan.uuid.riskDataId}
        workspaceId={actionPlan.uuid.workspaceId}
      />,
    );
  };

  return {
    onSelectRow,
  };
};
