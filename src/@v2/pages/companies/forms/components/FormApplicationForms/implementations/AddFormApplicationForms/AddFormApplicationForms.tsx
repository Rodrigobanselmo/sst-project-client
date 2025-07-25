import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useMutateAddFormApplication } from '@v2/services/forms/form-application/add-form-application/hooks/useMutateAddFormApplication';
import { useForm } from 'react-hook-form';
import {
  addFormApplicationFormInitialValues,
  IAddFormApplicationFormFields,
  schemaAddFormApplicationForm,
} from './AddFormApplicationForms.schema';
import { FormAddFormApplication } from './components/FormAddFormApplication';

export const AddFormApplicationForms = ({
  companyId,
}: {
  companyId: string;
}) => {
  const addMutate = useMutateAddFormApplication();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaAddFormApplicationForm),
    defaultValues: addFormApplicationFormInitialValues,
  });

  const onSubmit = async (data: IAddFormApplicationFormFields) => {
    await addMutate.mutateAsync({
      companyId,
      name: data.name,
      description: data.description,
      formId: data.form.id,
      hierarchyIds: [],
      workspaceIds: data.workspaceIds.map((workspace) => workspace.id),
    });
    closeModal(ModalKeyEnum.FORM_APPLICATION_ADD);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.FORM_APPLICATION_ADD}
      title="Criar Aplicação de Formulário"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormAddFormApplication companyId={companyId} />
      </SForm>
    </SModalWrapper>
  );
};
