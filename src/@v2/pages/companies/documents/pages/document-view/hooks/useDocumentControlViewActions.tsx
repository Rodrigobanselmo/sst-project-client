import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import { DocumentControlFileBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control-file/document-control-file-browse-result.model';
import { DocumentControlReadModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-read.model';
import dynamic from 'next/dynamic';

const EditDocumentControlFormsDynamic = dynamic(
  async () => {
    const mod = await import(
      '../../../components/DocumentControlForms/implementations/EditDocumentControlForms/EditDocumentControlForms'
    );
    return mod.EditDocumentControlForms;
  },
  { ssr: false },
);

const AddDocumentControlFileFormsDynamic = dynamic(
  async () => {
    const mod = await import(
      '../../../components/DocumentControlForms/implementations/AddDocumentControlFileForms/AddDocumentControlFileForms'
    );
    return mod.AddDocumentControlFileForms;
  },
  { ssr: false },
);

const EditDocumentControlFileFormsDynamic = dynamic(
  async () => {
    const mod = await import(
      '../../../components/DocumentControlForms/implementations/EditDocumentControlFileForms/EditDocumentControlFileForms'
    );
    return mod.EditDocumentControlFileForms;
  },
  { ssr: false },
);

export const useDocumentControlViewActions = () => {
  const { openModal } = useModal();

  const onDocumentControlEdit = (documentControl: DocumentControlReadModel) => {
    openModal(
      ModalKeyEnum.DOCUMENT_CONTROL_EDIT,
      <EditDocumentControlFormsDynamic documentControl={documentControl} />,
    );
  };

  const onDocumentControlFileAdd = (
    documentControl: DocumentControlReadModel,
  ) => {
    openModal(
      ModalKeyEnum.DOCUMENT_CONTROL_FILE_ADD,
      <AddDocumentControlFileFormsDynamic
        companyId={documentControl.companyId}
        documentControlId={documentControl.id}
      />,
    );
  };

  const onDocumentControlFileEdit = (
    documentControlFile: DocumentControlFileBrowseResultModel,
  ) => {
    openModal(
      ModalKeyEnum.DOCUMENT_CONTROL_FILE_EDIT,
      <EditDocumentControlFileFormsDynamic
        documentControlFile={documentControlFile}
      />,
    );
  };

  return {
    onDocumentControlEdit,
    onDocumentControlFileAdd,
    onDocumentControlFileEdit,
  };
};
