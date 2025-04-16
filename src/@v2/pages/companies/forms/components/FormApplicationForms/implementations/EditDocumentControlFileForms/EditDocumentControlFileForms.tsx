import { yupResolver } from '@hookform/resolvers/yup/dist/yup.js';
import { SForm } from '@v2/components/forms/providers/SFormProvide';
import { SModalWrapper } from '@v2/components/organisms/SModal/components/SModalWrapper/SModalWrapper';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { DocumentControlFileBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control-file/document-control-file-browse-result.model';
import { useMutateAddDocumentControlSystemFile } from '@v2/services/enterprise/document-control/document-control-file/add-document-control-system-file/hooks/useMutateAddDocumentControlSystemFile';
import { useMutateEditDocumentControlFile } from '@v2/services/enterprise/document-control/document-control-file/edit-document-control-file/hooks/useMutateEditDocumentControlFile';
import { FileAsync } from '@v2/types/file-async';
import { useForm } from 'react-hook-form';
import {
  IEditDocumentControlFormFields,
  schemaEditDocumentControlForm,
} from './EditDocumentControlFileForms.schema';
import { FormEditDocumentControlFile } from './components/FormEditDocumentControlFile';

export const EditDocumentControlFileForms = ({
  documentControlFile,
}: {
  documentControlFile: DocumentControlFileBrowseResultModel;
}) => {
  const editMutate = useMutateEditDocumentControlFile();
  const uploadMutate = useMutateAddDocumentControlSystemFile();
  const { closeModal } = useModal();

  const form = useForm({
    resolver: yupResolver(schemaEditDocumentControlForm),
    defaultValues: {
      name: documentControlFile.name,
      description: documentControlFile.description,
      endDate: documentControlFile.endDate || null,
      file: { name: documentControlFile.name } as unknown as FileAsync,
      startDate: documentControlFile.startDate || null,
    } satisfies IEditDocumentControlFormFields,
  });

  const onSubmit = async (data: IEditDocumentControlFormFields) => {
    await editMutate.mutateAsync({
      companyId: documentControlFile.companyId,
      name: data.file?.name,
      documentControlFileId: documentControlFile.id,
      description: data.description,
      fileId: data.file?.id,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    });
    closeModal(ModalKeyEnum.DOCUMENT_CONTROL_FILE_EDIT);
  };

  const onUpload = async (file: File) => {
    const uploaded = await uploadMutate.mutateAsync({
      file,
      companyId: documentControlFile.companyId,
    });
    return uploaded.id;
  };

  return (
    <SModalWrapper
      modalKey={ModalKeyEnum.DOCUMENT_CONTROL_FILE_EDIT}
      title="Documento"
      minWidthDesk={600}
      onSubmit={form.handleSubmit(onSubmit)}
      loading={uploadMutate.isPending}
    >
      <SForm form={form}>
        <FormEditDocumentControlFile onUpload={onUpload} />
      </SForm>
    </SModalWrapper>
  );
};
