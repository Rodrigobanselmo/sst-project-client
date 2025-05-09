import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { useFetchReadDocumentControl } from '@v2/services/enterprise/document-control/document-control/read-document-control/hooks/useFetchReadDocumentControl';
import { useDocumentControlViewActions } from '../../hooks/useDocumentControlViewActions';
import { DocumentControlCard } from './components/DocumentControlCard/DocumentControlCard';
import { DocumentControlFileTable } from './components/DocumentControlFileTable/DocumentControlFileTable';

export const DocumentControlView = ({
  companyId,
  documentControlId,
}: {
  companyId: string;
  documentControlId: number;
}) => {
  const {
    onDocumentControlEdit,
    onDocumentControlFileAdd,
    onDocumentControlFileEdit,
  } = useDocumentControlViewActions();
  const { documentControl, isLoading } = useFetchReadDocumentControl({
    companyId,
    documentControlId,
  });

  const handleEdit = () => {
    if (documentControl) onDocumentControlEdit(documentControl);
  };

  return (
    <>
      {isLoading || !documentControl ? (
        <SSkeleton height={200} />
      ) : (
        <SFlex direction="column" gap={20}>
          <DocumentControlCard
            documentControl={documentControl}
            onEdit={handleEdit}
          />
          <DocumentControlFileTable
            onAdd={() => onDocumentControlFileAdd(documentControl)}
            onEdit={onDocumentControlFileEdit}
            files={documentControl.files}
          />
        </SFlex>
      )}
    </>
  );
};
