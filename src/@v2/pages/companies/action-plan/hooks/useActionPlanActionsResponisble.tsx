import { ResponsibleBrowseResultModel } from '@v2/models/security/models/responsible/responsible-browse-result.model';
import { useMutateEditActionPlan } from '@v2/services/security/action-plan/action-plan/edit-action-plan/hooks/useMutateEditActionPlan';
import { useMutateEditManyActionPlan } from '@v2/services/security/action-plan/action-plan/edit-many-action-plan/hooks/useMutateEditManyActionPlan';
import { ModalEnum } from 'core/enums/modal.enums';
import { useModal } from 'core/hooks/useModal';

export interface IActionPlanUUIDParams {
  riskDataId: string;
  recommendationId: string;
  workspaceId: string;
}

export interface IEditActionPlanResponsibleParams {
  uuid: IActionPlanUUIDParams;
  responsibleId: number | null;
  employeeId: number | null;
  data: ResponsibleBrowseResultModel | null;
}

export interface IEditManyActionPlanResponsibleParams {
  uuids: IActionPlanUUIDParams[];
  responsibleId: number | null;
  employeeId: number | null;
  data: ResponsibleBrowseResultModel | null;
}

export const useActionPlanResponsibleActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const { onStackOpenModal } = useModal();
  const editActionPlan = useMutateEditActionPlan();
  const editManyActionPlan = useMutateEditManyActionPlan();

  const onEditActionPlanResponsible = (
    data: IEditActionPlanResponsibleParams,
  ) => {
    const onSubmit = (userId?: number) => {
      editActionPlan.mutateAsync({
        companyId,
        workspaceId: data.uuid.workspaceId,
        recommendationId: data.uuid.recommendationId,
        riskDataId: data.uuid.riskDataId,
        responsibleId: userId || data.responsibleId,
      });
    };

    //! old code
    if (data.employeeId) {
      onStackOpenModal(ModalEnum.USER_ADD, {
        company: { id: companyId },
        name: data.data?.name,
        email: data.data?.email,
        employeeId: data.employeeId,
        onSubmit: (user) => onSubmit(user?.id),
      });
      return;
    }
    //! old code

    onSubmit();
  };

  const onEditManyActionPlanResponsible = (
    data: IEditManyActionPlanResponsibleParams,
  ) => {
    const onSubmit = (userId?: number) => {
      editManyActionPlan.mutateAsync({
        companyId,
        responsibleId: userId || data.responsibleId,
        ids: data.uuids,
      });
    };

    //! old code
    if (data.employeeId) {
      onStackOpenModal(ModalEnum.USER_ADD, {
        company: { id: companyId },
        name: data.data?.name,
        email: data.data?.email,
        employeeId: data.employeeId,
        onSubmit: (user) => onSubmit(user?.id),
      });
      return;
    }
    //! old code

    onSubmit();
  };

  return {
    onEditActionPlanResponsible,
    onEditManyActionPlanResponsible,
    isLoading: editActionPlan.isPending || editManyActionPlan.isPending,
  };
};
