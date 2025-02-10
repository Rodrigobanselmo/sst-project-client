import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import dynamic from 'next/dynamic';

const FormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/DocumentControlForms/DocumentControlForms/DocumentControlForms'
    );
    return mod.DocumentControlForm;
  },
  { ssr: false },
);

export const useCommentActions = ({
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

  return {
    onDocumentControlAdd,
  };
};
