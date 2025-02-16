import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import dynamic from 'next/dynamic';

const DocumentControlViewDynamic = dynamic(
  async () => {
    const mod = await import(
      '../pages/document-view/components/DocumentControlView/DocumentControlView'
    );
    return mod.DocumentControlView;
  },
  { ssr: false },
);

const FormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/DocumentControlForms/DocumentControlForms/DocumentControlForms'
    );
    return mod.DocumentControlForm;
  },
  { ssr: false },
);

export const useDocumentControlActions = ({
  companyId,
  workspaceId,
}: {
  companyId: string;
  workspaceId: string;
}) => {
  const { openModal } = useModal();

  const onDocumentControlAdd = () => {
    openModal(
      ModalKeyEnum.DOCUMENT_CONTROL_ADD,
      <FormDynamic companyId={companyId} workspaceId={workspaceId} />,
    );
  };

  const onDocumentControlClick = (id: number) => {
    openModal(
      ModalKeyEnum.DOCUMENT_CONTROL_ADD,
      <DocumentControlViewDynamic
        companyId={companyId}
        documentControlId={id}
      />,
    );
  };

  return {
    onDocumentControlAdd,
    onDocumentControlClick,
  };
};
