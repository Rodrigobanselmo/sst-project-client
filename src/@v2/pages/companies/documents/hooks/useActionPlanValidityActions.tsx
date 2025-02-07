import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { CommentTextTypeEnum } from '@v2/models/security/enums/comment-text-type.enum';
import { useMutateEditActionPlan } from '@v2/services/security/action-plan/action-plan/edit-action-plan/hooks/useMutateEditActionPlan';
import { useMutateEditManyActionPlan } from '@v2/services/security/action-plan/action-plan/edit-many-action-plan/hooks/useMutateEditManyActionPlan';
import { dateUtils } from '@v2/utils/date-utils';
import dynamic from 'next/dynamic';

export interface IActionPlanUUIDParams {
  riskDataId: string;
  recommendationId: string;
  workspaceId: string;
}

export interface IEditActionPlanValidityParams {
  uuid: IActionPlanUUIDParams;
  valdityEndDate: Date | null;
}

export interface IEditManyActionPlanValidityParams {
  uuids: IActionPlanUUIDParams[];
  valdityEndDate: Date | null;
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

export const useActionPlanValidityActions = ({
  companyId,
}: {
  companyId: string;
}) => {
  const editActionPlan = useMutateEditActionPlan();
  const editManyActionPlan = useMutateEditManyActionPlan();
  const { openModal } = useModal();

  const onEditValidy = (
    date: Date | null,
    onEdit: (args?: {
      text?: string;
      textType?: CommentTextTypeEnum;
    }) => Promise<void>,
  ) => {
    openModal(
      ModalKeyEnum.ACTION_PLAN_COMMENT,
      <ActionPlanCommentFormDynamic
        text={
          <>
            Novo Prazo:{' '}
            <span style={{ fontWeight: 600 }}>
              {date ? dateUtils(date).format() : 'Sem prazo'}
            </span>
          </>
        }
        onEdit={({ text, textType }) =>
          onEdit({ text, textType: textType.value })
        }
      />,
    );
  };

  const onEditActionPlanValidy = (data: IEditActionPlanValidityParams) => {
    onEditValidy(data.valdityEndDate, (comment) =>
      editActionPlan.mutateAsync({
        companyId,
        workspaceId: data.uuid.workspaceId,
        recommendationId: data.uuid.recommendationId,
        riskDataId: data.uuid.riskDataId,
        validDate: data.valdityEndDate,
        comment,
      }),
    );
  };

  const onEditManyActionPlanValidy = (
    data: IEditManyActionPlanValidityParams,
  ) => {
    onEditValidy(data.valdityEndDate, (comment) =>
      editManyActionPlan.mutateAsync({
        ids: data.uuids,
        companyId,
        validDate: data.valdityEndDate,
        comment,
      }),
    );
  };

  return {
    onEditActionPlanValidy,
    onEditManyActionPlanValidy,
    isLoading: editActionPlan.isPending,
  };
};
