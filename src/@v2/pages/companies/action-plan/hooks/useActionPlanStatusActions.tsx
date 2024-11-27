import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ActionPlanStatusEnum } from '@v2/models/security/enums/action-plan-status.enum';
import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';
import { ActionPlanStatusTypeTranslate } from '@v2/models/security/translations/action-plan-status-type.translaton';
import { useMutateEditActionPlan } from '@v2/services/security/action-plan/action-plan/edit-action-plan/hooks/useMutateEditActionPlan';
import { useMutateEditManyActionPlan } from '@v2/services/security/action-plan/action-plan/edit-many-action-plan/hooks/useMutateEditManyActionPlan';
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

export interface IEditManyActionPlanStatusParams {
  uuids: IActionPlanUUIDParams[];
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

export const useActionPlanStatusActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const editActionPlan = useMutateEditActionPlan();
  const editManyActionPlan = useMutateEditManyActionPlan();
  const { openModal } = useModal();

  const onEditStatus = (
    status: ActionPlanStatusEnum,
    onEdit: (args?: {
      text?: string;
      textType?: CommentTextTypeEnum;
    }) => Promise<void>,
  ) => {
    const isCancel = status === ActionPlanStatusEnum.CANCELED;
    const isDone = status === ActionPlanStatusEnum.DONE;
    const isCommentNecessary = isCancel || isDone;

    if (!isCommentNecessary) {
      onEdit();
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
                {ActionPlanStatusTypeTranslate[status]}
              </span>
            </>
          }
          onEdit={({ text, textType }) =>
            onEdit({ text, textType: textType.value })
          }
        />,
      );
    }

    if (isDone) {
      openModal(
        ModalKeyEnum.ACTION_PLAN_COMMENT,
        <ActionPlanCommentDoneFormDynamic
          onEdit={({ text }) => onEdit({ text })}
        />,
      );
    }
  };

  const onEditActionPlanStatus = (data: IEditActionPlanStatusParams) => {
    onEditStatus(data.status, (comment) =>
      editActionPlan.mutateAsync({
        companyId,
        workspaceId: data.uuid.workspaceId,
        recommendationId: data.uuid.recommendationId,
        riskDataId: data.uuid.riskDataId,
        status: data.status,
        comment: comment ? comment : undefined,
      }),
    );
  };

  const onEditManyActionPlanStatus = (
    data: IEditManyActionPlanStatusParams,
  ) => {
    onEditStatus(data.status, (comment) =>
      editManyActionPlan.mutateAsync({
        companyId,
        status: data.status,
        comment: comment ? comment : undefined,
        ids: data.uuids,
      }),
    );
  };

  return {
    onEditActionPlanStatus,
    onEditManyActionPlanStatus,
    isLoading: editActionPlan.isPending || editManyActionPlan.isPending,
  };
};
