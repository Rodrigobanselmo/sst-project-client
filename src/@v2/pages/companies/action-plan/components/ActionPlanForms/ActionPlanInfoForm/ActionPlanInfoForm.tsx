import { useRouter } from 'next/router';

import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { CForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalButtons } from '@v2/components/organisms/SModal/components/SModalButtons/SModalButtons';
import { SModalHeader } from '@v2/components/organisms/SModal/components/SModalHeader/SModalHeader';
import { SModalPaper } from '@v2/components/organisms/SModal/components/SModalPaper/SModalPaper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useMutateEditActionPlanInfo } from '@v2/services/security/action-plan/edit-action-plan-info/hooks/useMutateEditActionPlanInfo';
import { useForm } from 'react-hook-form';
import {
  actionPlanInfoFormInitialValues,
  schemaActionPlanInfoForm,
} from './ActionPlanInfoForm.schema';
import { FormActionPlanInfo } from './components/FormActionPlanInfo';
import { useFetchReadActionPlanInfo } from '@v2/services/security/action-plan/read-action-plan-info/hooks/useFetchReadActionPlanInfo';

export const ActionPlanInfoForm = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId?: string;
}) => {
  const router = useRouter();
  const { closeModal } = useModal();

  const editActionPlanInfo = useMutateEditActionPlanInfo();

  const { data, isLoading } = useFetchReadActionPlanInfo({
    companyId,
    workspaceId: workspaceId || '',
  });

  const form = useForm({
    resolver: yupResolver(schemaActionPlanInfoForm),
    defaultValues: actionPlanInfoFormInitialValues,
  });

  const onSubmit = (second: any) => {
    console.log(second);
  };

  return (
    <SModalPaper minWidthDesk={900}>
      <SModalHeader
        title="Editar Plano de Ação"
        onClose={() => closeModal(ModalKeyEnum.EDIT_ACTION_PLAN_INFO)}
      />
      <CForm form={form}>
        <FormActionPlanInfo companyId={companyId} />
      </CForm>
      <SModalButtons>
        <SButton
          onClick={form.handleSubmit(onSubmit)}
          minWidth={100}
          color="primary"
          variant="outlined"
          size="l"
          text="Cancelar"
        />
        <SButton
          onClick={form.handleSubmit(onSubmit)}
          minWidth={100}
          color="primary"
          variant="contained"
          size="l"
          text="Salvar"
        />
      </SModalButtons>
    </SModalPaper>
  );
};
