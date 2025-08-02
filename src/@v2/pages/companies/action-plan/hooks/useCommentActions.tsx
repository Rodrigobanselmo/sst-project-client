import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { CommentApprovedStatusEnum } from '@v2/models/security/enums/comment-approved-status.enum';
import { useMutateEditManyComments } from '@v2/services/security/action-plan/comment/edit-many-comments/hooks/useMutateEditManyComments';
import dynamic from 'next/dynamic';

export interface IEditManyActionPlanStatusParams {
  ids: string[];
  status: CommentApprovedStatusEnum;
}

const CommentApprovedFormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/CommentForms/CommentApprovedForm/CommentApprovedForm'
    );
    return mod.CommentApprovedForm;
  },
  { ssr: false },
);

export const useCommentActions = ({ companyId }: { companyId: string }) => {
  const editManyComments = useMutateEditManyComments();
  const { openModal } = useModal();

  const onEditApproved = (
    status: CommentApprovedStatusEnum,
    onEdit: (args?: { text?: string }) => Promise<void>,
  ) => {
    const isCommentNecessary = status !== CommentApprovedStatusEnum.NONE;

    if (!isCommentNecessary) {
      onEdit();
      return;
    }

    openModal(
      ModalKeyEnum.ACTION_PLAN_COMMENT_APPROVE,
      <CommentApprovedFormDynamic onEdit={({ text }) => onEdit({ text })} />,
    );
  };

  const onEditManyComments = (data: IEditManyActionPlanStatusParams) => {
    const isApproved =
      data.status === CommentApprovedStatusEnum.NONE
        ? null
        : data.status === CommentApprovedStatusEnum.APPROVED
          ? true
          : false;

    onEditApproved(data.status, (comment) =>
      editManyComments.mutateAsync({
        companyId,
        approvedComment: comment ? comment.text : undefined,
        isApproved,
        ids: data.ids,
      }),
    );
  };

  return {
    onEditManyComments,
    isLoading: editManyComments.isPending,
  };
};
