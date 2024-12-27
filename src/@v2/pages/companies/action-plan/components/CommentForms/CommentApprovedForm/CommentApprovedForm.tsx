import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { CForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useForm } from 'react-hook-form';
import {
  commentApprovedFormInitialValues,
  ICommentApprovedFormFormFields,
  schemaCommentApprovedForm,
} from './CommentApprovedForm.schema';
import { FormCommentApproved } from './components/FormCommentApproved';

export const CommentApprovedForm = ({
  onEdit,
}: {
  onEdit: (values: ICommentApprovedFormFormFields) => Promise<void>;
}) => {
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaCommentApprovedForm),
    defaultValues: commentApprovedFormInitialValues,
  });

  const onSubmit = async (data: ICommentApprovedFormFormFields) => {
    await onEdit(data);
    closeModal(ModalKeyEnum.ACTION_PLAN_COMMENT_APPROVE);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_COMMENT_APPROVE}
      title="Comentário"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <CForm form={form}>
        <FormCommentApproved />
      </CForm>
    </SModalWrapper>
  );
};
