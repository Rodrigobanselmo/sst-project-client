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
import { useFetchReadActionPlan } from '@v2/services/security/action-plan/action-plan/read-action-plan/hooks/useFetchReadActionPlan';
import { ActionPlanRecommendationsPhotos } from '../../ActionPlanRecommendationsPhotos/ActionPlanRecommendationsPhotos';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { ActionPlanCommentPhotos } from './components/ActionPlanCommentPhotos';

export interface IActionPlanUUIDParams {
  riskDataId: string;
  recommendationId: string;
  workspaceId: string;
  companyId: string;
}

export const ActionPlanCommentDoneForm = ({
  onEdit,
  uuid,
}: {
  onEdit: (values: IActionPlanCommentDoneFormFormFields) => Promise<void>;
  uuid?: IActionPlanUUIDParams;
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

        {!!uuid && <ActionPlanCommentPhotos uuid={uuid} />}
      </SForm>
    </SModalWrapper>
  );
};
