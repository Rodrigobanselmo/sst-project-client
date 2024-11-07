import { BoxProps } from '@mui/material';

import { useModal } from 'core/hooks/useModal';

export interface IActionPlanTableTableProps extends BoxProps {
  companyId?: string;
}

export const useActionPlanActions = ({ companyId }) => {
  const handleActionPlanEditStage = async ({
    id,
    stageId,
    name,
    type,
  }: any) => {
    // await upsertMutation
    //   .mutateAsync({
    //     id,
    //     stageId,
    //     companyId,
    //     workspaceId,
    //     name,
    //     type,
    //   })
    //   .catch(() => {});
  };

  const handleActionPlanExport = async () => {
    // await exportMutation
    //   .mutateAsync({ companyId, workspaceId })
    //   .catch(() => {});
  };

  return {
    handleActionPlanEditStage,
    handleActionPlanExport,
  };
};
