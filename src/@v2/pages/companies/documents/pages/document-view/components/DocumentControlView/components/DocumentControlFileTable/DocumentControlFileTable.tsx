import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SSkeleton } from '@v2/components/atoms/SSkeleton/SDivider';
import { SDocumentControlFileTable } from '@v2/components/organisms/STable/implementation/SDocumentControlFileTable/SDocumentControlFileTable';
import { useFetchReadDocumentControl } from '@v2/services/enterprise/document-control/document-control/read-document-control/hooks/useFetchReadDocumentControl';
import { useDocumentControlViewActions } from '../../../../hooks/useDocumentControlViewActions';
import { DocumentControlCard } from '../DocumentControlCard/DocumentControlCard';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { IDocumentControlFileFilterProps } from '@v2/components/organisms/STable/implementation/SDocumentControlFileTable/SDocumentControlFileTable.types';
import { DocumentControlFileBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control-file/document-control-file-browse-result.model';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { removeAccents } from '@v2/utils/remove-accesnts';
import { Box } from '@mui/material';
import { DocumentControlReadModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-read.model';

type Props = {
  files: DocumentControlFileBrowseResultModel[];
  onAdd: () => void;
  onEdit: (documentControl: DocumentControlFileBrowseResultModel) => void;
};

export const DocumentControlFileTable = ({ files, onEdit, onAdd }: Props) => {
  const { queryParams, setQueryParams } =
    useQueryParamsState<IDocumentControlFileFilterProps>();

  const { onFilterData } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: { search: null },
    cleanData: { search: '' },
  });

  const search = queryParams.search;
  const filterFiles = search
    ? files.filter((file) =>
        removeAccents(file.name)
          .toLocaleLowerCase()
          .includes(removeAccents(String(search)).toLocaleLowerCase()),
      )
    : files;

  return (
    <Box>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          <STableAddButton onClick={onAdd} />
        </STableSearchContent>
      </STableSearch>
      <SDocumentControlFileTable
        data={filterFiles}
        onSelectRow={(row) => onEdit(row)}
      />
    </Box>
  );
};
