import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { ReactNode, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  actionPlanCommentDoneFormInitialValues,
  IActionPlanCommentDoneFormFormFields,
  schemaActionPlanCommentDoneForm,
} from './ActionPlanCommentDoneForm.schema';
import { FormActionPlanCommentDone } from './components/FormActionPlanComment';

export const ActionPlanCommentDoneForm = ({
  onEdit,
}: {
  onEdit: (values: IActionPlanCommentDoneFormFormFields) => Promise<void>;
}) => {
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaActionPlanCommentDoneForm),
    defaultValues: actionPlanCommentDoneFormInitialValues,
  });

  const onSubmit = async (data: IActionPlanCommentDoneFormFormFields) => {
    await onEdit(data);
    closeModal(ModalKeyEnum.ACTION_PLAN_COMMENT);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_COMMENT}
      title="Comentário"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormActionPlanCommentDone />
      </SForm>
    </SModalWrapper>
  );
};
