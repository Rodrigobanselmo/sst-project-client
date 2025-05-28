import { PageRoutes } from '@v2/constants/pages/routes';
import { useAppRouter } from '@v2/hooks/useAppRouter';
import { ModalKeyEnum, useModal } from '@v2/hooks/useModal';
import dynamic from 'next/dynamic';

const FormDynamic = dynamic(
  async () => {
    const mod = await import(
      '../components/DocumentControlForms/implementations/AddDocumentControlForms/AddDocumentControlForms'
    );
    return mod.AddDocumentControlForms;
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
  const router = useAppRouter();

  const onDocumentControlAdd = () => {
    openModal(
      ModalKeyEnum.DOCUMENT_CONTROL_ADD,
      <FormDynamic companyId={companyId} workspaceId={workspaceId} />,
    );
  };

  const onDocumentControlClick = (id: number) => {
    router.push(PageRoutes.DOCUMENTS.VIEW, {
      pathParams: { companyId, id },
    });
  };

  return {
    onDocumentControlAdd,
    onDocumentControlClick,
  };
};
