import { BoxProps } from '@mui/material';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ActionPlanBrowseResultModel } from '@v2/models/security/models/action-plan/action-plan-browse-result.model';
import dynamic from 'next/dynamic';

export interface IActionPlanTableTableProps extends BoxProps {
  companyId?: string;
}

const ActionPlanInfoFormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/ActionPlanForms/ActionPlanInfoForm/ActionPlanInfoForm'
    );
    return mod.ActionPlanInfoForm;
  },
  { ssr: false },
);

export const useActionPlanActions = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId?: string;
}) => {
  const { openModal } = useModal();

  const handleEditActionPlanInfo = () => {
    openModal(
      ModalKeyEnum.EDIT_ACTION_PLAN_INFO,
      <ActionPlanInfoFormDynamic
        workspaceId={workspaceId}
        companyId={companyId}
      />,
    );
  };

  const handleActionPlanEditStage = (data: ActionPlanBrowseResultModel) => {
    //
  };

  return { handleEditActionPlanInfo, handleActionPlanEditStage };
};
