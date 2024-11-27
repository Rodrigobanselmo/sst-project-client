import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { CForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalButtons } from '@v2/components/organisms/SModal/components/SModalButtons/SModalButtons';
import { SModalHeader } from '@v2/components/organisms/SModal/components/SModalHeader/SModalHeader';
import { SModalPaper } from '@v2/components/organisms/SModal/components/SModalPaper/SModalPaper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useMutateEditActionPlanInfo } from '@v2/services/security/action-plan/action-plan-info/edit-action-plan-info/hooks/useMutateEditActionPlanInfo';
import { useFetchReadActionPlanInfo } from '@v2/services/security/action-plan/action-plan-info/read-action-plan-info/hooks/useFetchReadActionPlanInfo';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  actionPlanInfoFormInitialValues,
  IActionPlanInfoFormFormFields,
  schemaActionPlanInfoForm,
} from './ActionPlanInfoForm.schema';
import { FormActionPlanInfo } from './components/FormActionPlanInfo';
import { SInputMultilineForm } from '@v2/components/forms/controlled/SInputMultilineForm/SInputMultilineForm';

export const ActionPlanInfoForm = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId: string;
}) => {
  const { closeModal } = useModal();

  const editActionPlanInfo = useMutateEditActionPlanInfo();

  const { data } = useFetchReadActionPlanInfo({
    companyId,
    workspaceId: workspaceId,
  });

  const form = useForm({
    resolver: yupResolver(schemaActionPlanInfoForm),
    defaultValues: actionPlanInfoFormInitialValues,
  });

  const onSubmit = async (data: IActionPlanInfoFormFormFields) => {
    await editActionPlanInfo.mutateAsync({
      companyId,
      workspaceId,
      coordinatorId: data.coordinator?.id || null,
      validityStart: data.validityStart,
      validityEnd: data.validityEnd,
      monthsLevel_2: data.monthsLevel_2,
      monthsLevel_3: data.monthsLevel_3,
      monthsLevel_4: data.monthsLevel_4,
      monthsLevel_5: data.monthsLevel_5,
    });

    closeModal(ModalKeyEnum.ACTION_PLAN_INFO_EDIT);
  };

  useEffect(() => {
    if (data) {
      form.reset({
        coordinator: data.coordinator,
        validityEnd: data.validityEnd || undefined,
        validityStart: data.validityStart || undefined,
        monthsLevel_2: data.periods.monthsLevel_2,
        monthsLevel_3: data.periods.monthsLevel_3,
        monthsLevel_4: data.periods.monthsLevel_4,
        monthsLevel_5: data.periods.monthsLevel_5,
      });
    }
  }, [data, form]);

  return (
    <SModalPaper minWidthDesk={900} center={false}>
      <SModalHeader
        title="Editar Plano de Ação"
        onClose={() => closeModal(ModalKeyEnum.ACTION_PLAN_INFO_EDIT)}
      />
      <CForm form={form}>
        <FormActionPlanInfo companyId={companyId} />
      </CForm>
      <SModalButtons>
        <SButton
          onClick={() => closeModal()}
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
