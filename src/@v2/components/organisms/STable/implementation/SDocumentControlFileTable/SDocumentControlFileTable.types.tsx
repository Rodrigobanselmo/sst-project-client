import { DocumentControlFileBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control-file/document-control-file-browse-result.model';

export interface ISDocumentControlFileTableProps {
  data?: DocumentControlFileBrowseResultModel[];
  isLoading?: boolean;
  onSelectRow: (row: DocumentControlFileBrowseResultModel) => void;
}
