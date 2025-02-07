import { BoxProps } from '@mui/material';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import dynamic from 'next/dynamic';
import { useEffect } from 'react';

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

export const useActionPlanInfoActions = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId: string;
}) => {
  const { openModal, closeModal } = useModal();

  const onAddActionPlanInfo = () => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_INFO_EDIT,
      <ActionPlanInfoFormDynamic
        workspaceId={workspaceId}
        companyId={companyId}
      />,
    );
  };

  const onEditActionPlanInfo = () => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_INFO_EDIT,
      <ActionPlanInfoFormDynamic
        workspaceId={workspaceId}
        companyId={companyId}
      />,
    );
  };

  useEffect(() => {
    return () => closeModal(ModalKeyEnum.ACTION_PLAN_INFO_EDIT);
  }, [closeModal]);

  return { onEditActionPlanInfo, onAddActionPlanInfo };
};
