import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { useMutateEditFormApplication } from '@v2/services/forms/form-application/edit-form-application/hooks/useMutateEditFormApplication';
import { useForm } from 'react-hook-form';
import {
  IEditFormApplicationFormFields,
  schemaEditFormApplicationForm,
} from './EditFormApplicationForms.schema';
import { FormEditFormApplication } from './components/FormEditFormApplication';

export const EditFormApplicationForms = ({
  formApplication,
}: {
  formApplication: FormApplicationReadModel;
}) => {
  const editMutate = useMutateEditFormApplication();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaEditFormApplicationForm),
    defaultValues: {
      name: formApplication.name,
      // type: formIdentifierTypeMap(formApplication.type),
      description: formApplication.description,
    } satisfies IEditFormApplicationFormFields,
  });

  const onSubmit = async (data: IEditFormApplicationFormFields) => {
    // await editMutate.mutateAsync({
    //   companyId: formApplication.companyId,
    //   formApplicationId: formApplication.id,
    //   name: data.name,
    //   description: data.description,
    //   type:
    //     data.type.value === FormIdentifierTypeEnum.CUSTOM && data.typeText
    //       ? data.typeText
    //       : data.type.value,
    // });
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_EDIT);
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.DOCUMENT_CONTROL_EDIT}
      title="Documento"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormEditFormApplication companyId={''} />
      </SForm>
    </SModalWrapper>
  );
};
