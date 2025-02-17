import { FC } from 'react';

import { DocumentControlBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-browse-result.model';
import { SDownloadRow } from '../../addons/addons-rows/SDownloadRow/SDownloadRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { DocumentControlFileHeaderRow } from './components/DocumentControlFileHeaderRow/DocumentControlFileHeaderRow';
import { DocumentControlFileColumnsEnum as columnsEnum } from './enums/document-control-file-columns.enum';
import { DocumentControlFileColumnMap as columnMap } from './maps/document-control-file-column-map';
import { ISDocumentControlFileTableProps } from './SDocumentControlFileTable.types';
import { DocumentControlFileBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control-file/document-control-file-browse-result.model';

export const SDocumentControlFileTable: FC<ISDocumentControlFileTableProps> = ({
  data = [],
  isLoading,
  onSelectRow,
}) => {
  const tableRows: ITableData<DocumentControlFileBrowseResultModel>[] = [
    // NAME
    {
      column: '350px',
      header: (
        <DocumentControlFileHeaderRow
          text={columnMap[columnsEnum.NAME].label}
        />
      ),
      row: (row) => <STextRow lineNumber={1} text={row.name} />,
    },

    // DESCRIPTION
    {
      column: '3fr',
      header: (
        <DocumentControlFileHeaderRow
          text={columnMap[columnsEnum.DESCRIPTION].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.description || '-'} />,
    },

    // START DATE
    {
      column: '1fr',
      header: (
        <DocumentControlFileHeaderRow
          justify="center"
          text={columnMap[columnsEnum.START_DATE].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          lineNumber={1}
          text={row.formatedStartDate || '-'}
        />
      ),
    },
    // END DATE
    {
      column: '1fr',
      header: (
        <DocumentControlFileHeaderRow
          justify="center"
          text={columnMap[columnsEnum.END_DATE].label}
        />
      ),
      row: (row) => (
        <STextRow
          color={row.isExpired ? 'error.main' : undefined}
          justify="center"
          lineNumber={1}
          text={row.formatedEndDate || '-'}
        />
      ),
    },
    // FILE
    {
      column: '1fr',
      header: (
        <DocumentControlFileHeaderRow
          justify="center"
          text={columnMap[columnsEnum.FILE].label}
        />
      ),
      row: (row) => <SDownloadRow url={row.file?.url} />,
    },
  ];

  return (
    <STable
      isLoadingMore={isLoading}
      table={tableRows}
      data={data}
      renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
      renderBody={({ data, rows }) => (
        <STableBody
          rows={data}
          renderRow={(row) => {
            return (
              <STableRow
                clickable
                onClick={() => onSelectRow(row)}
                key={row.id}
                minHeight={35}
              >
                {rows.map((render) => render(row))}
              </STableRow>
            );
          }}
        />
      )}
    />
  );
};
