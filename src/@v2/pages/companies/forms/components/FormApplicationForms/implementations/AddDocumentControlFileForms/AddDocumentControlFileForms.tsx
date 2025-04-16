import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { useMutateAddDocumentControlFile } from '@v2/services/enterprise/document-control/document-control-file/add-document-control-file/hooks/useMutateAddDocumentControlFile';
import { useMutateAddDocumentControlSystemFile } from '@v2/services/enterprise/document-control/document-control-file/add-document-control-system-file/hooks/useMutateAddDocumentControlSystemFile';
import { useForm } from 'react-hook-form';
import {
  addDocumentControlFormFileInitialValues,
  IAddDocumentControlFormFileFields,
  schemaAddDocumentControlFileForm,
} from './AddDocumentControlFileForms.schema';
import { FormAddDocumentControlFile } from './components/FormAddDocumentControlFile';

export const AddDocumentControlFileForms = ({
  companyId,
  documentControlId,
}: {
  companyId: string;
  documentControlId: number;
}) => {
  const uploadMutate = useMutateAddDocumentControlSystemFile();
  const addMutate = useMutateAddDocumentControlFile();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaAddDocumentControlFileForm),
    defaultValues: addDocumentControlFormFileInitialValues,
  });

  const onSubmit = async (data: IAddDocumentControlFormFileFields) => {
    await addMutate.mutateAsync({
      companyId,
      name: data.file?.name,
      documentControlId,
      description: data.description,
      fileId: data.file?.id,
      startDate: data.startDate || undefined,
      endDate: data.endDate || undefined,
    });
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_FILE_ADD);
  };

  const onUpload = async (file: File) => {
    const uploaded = await uploadMutate.mutateAsync({ file, companyId });
    return uploaded.id;
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.DOCUMENT_CONTROL_FILE_ADD}
      title="Documento"
      minWidthDesk={600}
      loading={uploadMutate.isPending}
      onSubmit={form.handleSubmit(onSubmit)}
    >
      <SForm form={form}>
        <FormAddDocumentControlFile onUpload={onUpload} />
      </SForm>
    </SModalWrapper>
  );
};
