import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SText } from '@v2/components/atoms/SText/SText';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import palette from 'configs/theme/palette';
import { ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  actionPlanCommentFormInitialValues,
  IActionPlanCommentFormFormFields,
  schemaActionPlanCommentForm,
} from './ActionPlanCommentForm.schema';
import { FormActionPlanComment } from './components/FormActionPlanComment';

export const ActionPlanCommentForm = ({
  onEdit,
  text,
}: {
  onEdit: (values: IActionPlanCommentFormFormFields) => Promise<void>;
  text: ReactNode;
}) => {
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaActionPlanCommentForm),
    defaultValues: actionPlanCommentFormInitialValues,
  });

  const onSubmit = async (data: IActionPlanCommentFormFormFields) => {
    await onEdit(data);
    closeModal(ModalKeyEnum.ACTION_PLAN_COMMENT);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.ACTION_PLAN_COMMENT}
      minWidthDesk={600}
      title="Justificativa"
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <SText
          mb={8}
          fontSize={16}
          p={3}
          px={4}
          bgcolor={palette.schema.blueFade}
          borderRadius={1}
        >
          {text}
        </SText>
        <FormActionPlanComment />
      </SForm>
    </SModalWrapper>
  );
};
