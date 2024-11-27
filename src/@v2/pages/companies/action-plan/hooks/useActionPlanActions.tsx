import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import { useMutateEditActionPlan } from '@v2/services/security/action-plan/action-plan/edit-action-plan/hooks/useMutateEditActionPlan';
import { dateUtils } from '@v2/utils/date-utils';
import dynamic from 'next/dynamic';

export interface IActionPlanUUIDParams {
  riskDataId: string;
  recommendationId: string;
  workspaceId: string;
}

export interface IEditActionPlanResponsibleParams {
  uuid: IActionPlanUUIDParams;
  responsibleId: number | null;
}

export interface IEditActionPlanValidityParams {
  uuid: IActionPlanUUIDParams;
  valdityEndDate: Date | null;
}

export interface IEditActionPlanStatusParams {
  uuid: IActionPlanUUIDParams;
  status: ActionPlanStatusEnum;
}

const ActionPlanCommentFormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/ActionPlanForms/ActionPlanCommentForm/ActionPlanCommentForm'
    );
    return mod.ActionPlanCommentForm;
  },
  { ssr: false },
);

const ActionPlanCommentDoneFormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/ActionPlanForms/ActionPlanCommentDoneForm/ActionPlanCommentDoneForm'
    );
    return mod.ActionPlanCommentDoneForm;
  },
  { ssr: false },
);

export const useActionPlanActions = ({ companyId }: { companyId: string }) => {
  const editActionPlan = useMutateEditActionPlan();
  const { openModal } = useModal();

  const onEditActionPlanManyResponsible = (
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

  const onEditActionPlanValidy = (data: IEditActionPlanValidityParams) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_COMMENT,
      <ActionPlanCommentFormDynamic
        text={
          <>
            Novo Prazo:{' '}
            <span style={{ fontWeight: 600 }}>
              {data.valdityEndDate
                ? dateUtils(data.valdityEndDate).format()
                : 'Sem prazo'}
            </span>
          </>
        }
        onEdit={({ text, textType }) =>
          editActionPlan.mutateAsync({
            companyId,
            workspaceId: data.uuid.workspaceId,
            recommendationId: data.uuid.recommendationId,
            riskDataId: data.uuid.riskDataId,
            validDate: data.valdityEndDate,
            comment: {
              text,
              textType: textType.value,
            },
          })
        }
      />,
    );
  };

  const onEditActionPlanStatus = (data: IEditActionPlanStatusParams) => {
    const isCancel = data.status === ActionPlanStatusEnum.CANCELED;
    const isDone = data.status === ActionPlanStatusEnum.DONE;
    const isCommentNecessary = isCancel || isDone;

    if (!isCommentNecessary) {
      editActionPlan.mutateAsync({
        companyId,
        workspaceId: data.uuid.workspaceId,
        recommendationId: data.uuid.recommendationId,
        riskDataId: data.uuid.riskDataId,
        status: data.status,
      });

      return;
    }

    if (isCancel) {
      openModal(
        ModalKeyEnum.ACTION_PLAN_COMMENT,
        <ActionPlanCommentFormDynamic
          text={
            <>
              Novo Status:{' '}
              <span style={{ fontWeight: 600 }}>
                {ActionPlanStatusTypeTranslate[data.status]}
              </span>
            </>
          }
          onEdit={({ text, textType }) =>
            editActionPlan.mutateAsync({
              companyId,
              workspaceId: data.uuid.workspaceId,
              recommendationId: data.uuid.recommendationId,
              riskDataId: data.uuid.riskDataId,
              status: data.status,
              comment: {
                text,
                textType: textType.value,
              },
            })
          }
        />,
      );
    }

    if (isDone) {
      openModal(
        ModalKeyEnum.ACTION_PLAN_COMMENT,
        <ActionPlanCommentDoneFormDynamic
          onEdit={({ text }) =>
            editActionPlan.mutateAsync({
              companyId,
              workspaceId: data.uuid.workspaceId,
              recommendationId: data.uuid.recommendationId,
              riskDataId: data.uuid.riskDataId,
              status: data.status,
              comment: {
                text,
              },
            })
          }
        />,
      );
    }
  };

  return {
    onEditActionPlanResponsible,
    onEditActionPlanValidy,
    onEditActionPlanStatus,
  };
};
