import { useMutateEditActionPlan } from '@v2/services/security/action-plan/action-plan/edit-action-plan/hooks/useMutateEditActionPlan';
import { useMutateEditManyActionPlan } from '@v2/services/security/action-plan/action-plan/edit-many-action-plan/hooks/useMutateEditManyActionPlan';

export interface IActionPlanUUIDParams {
  riskDataId: string;
  recommendationId: string;
  workspaceId: string;
}

export interface IEditActionPlanResponsibleParams {
  uuid: IActionPlanUUIDParams;
  responsibleId: number | null;
}

export interface IEditManyActionPlanResponsibleParams {
  uuids: IActionPlanUUIDParams[];
  responsibleId: number | null;
}

export const useActionPlanResponsiblesActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const editActionPlan = useMutateEditActionPlan();
  const editManyActionPlan = useMutateEditManyActionPlan();

  const onEditActionPlanResponsible = (
    data: IEditActionPlanResponsibleParams,
  ) => {
    editActionPlan.mutateAsync({
      companyId,
      workspaceId: data.uuid.workspaceId,
      recommendationId: data.uuid.recommendationId,
      riskDataId: data.uuid.riskDataId,
      responsibleId: data.responsibleId,
    });
  };

  const onEditManyActionPlanResponsible = (
    data: IEditManyActionPlanResponsibleParams,
  ) => {
    editManyActionPlan.mutateAsync({
      companyId,
      responsibleId: data.responsibleId,
      ids: data.uuids,
    });
  };

  return {
    onEditActionPlanResponsible,
    onEditManyActionPlanResponsible,
    isLoading: editActionPlan.isPending || editManyActionPlan.isPending,
  };
};
