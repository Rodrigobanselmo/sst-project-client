import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useMutateAddDocumentControlSystemFile } from '@v2/services/enterprise/document-control/document-control-file/add-document-control-system-file/hooks/useMutateAddDocumentControlSystemFile';
import { useMutateAddDocumentControl } from '@v2/services/enterprise/document-control/document-control/add-document-control/hooks/useMutateAddDocumentControl';
import { useForm } from 'react-hook-form';
import { DocumentControlTypeEnum } from '../../constants/document-type.map';
import {
  addDocumentControlFormInitialValues,
  IAddDocumentControlFormFields,
  schemaAddDocumentControlForm,
} from './AddDocumentControlForms.schema';
import { FormAddDocumentControl } from './components/FormAddDocumentControl';

export const AddDocumentControlForms = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId: string;
}) => {
  const uploadMutate = useMutateAddDocumentControlSystemFile();
  const addMutate = useMutateAddDocumentControl();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaAddDocumentControlForm),
    defaultValues: addDocumentControlFormInitialValues,
  });

  const onSubmit = async (data: IAddDocumentControlFormFields) => {
    await addMutate.mutateAsync({
      companyId,
      workspaceId,
      name: data.name,
      description: data.description,
      type:
        data.type.value === DocumentControlTypeEnum.OTHER && data.typeText
          ? data.typeText
          : data.type.value,
      file: {
        fileId: data.file?.id,
        name: data.file?.name,
        startDate: data.startDate || undefined,
        endDate: data.endDate || undefined,
      },
    });
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_ADD);
  };

  const onUpload = async (file: File) => {
    const uploaded = await uploadMutate.mutateAsync({ file, companyId });
    return uploaded.id;
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.DOCUMENT_CONTROL_ADD}
      title="Documento"
      minWidthDesk={600}
      loading={uploadMutate.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormAddDocumentControl onUpload={onUpload} />
      </SForm>
    </SModalWrapper>
  );
};
