import { FC } from 'react';

import { DocumentControlBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-browse-result.model';
import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';
import { SDownloadRow } from '../../addons/addons-rows/SDownloadRow/SDownloadRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { DocumentControlHeaderRow } from './components/DocumentControlHeaderRow/DocumentControlHeaderRow';
import { DocumentControlColumnsEnum as columnsEnum } from './enums/document-control-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { DocumentControlColumnMap as columnMap } from './maps/document-control-column-map';
import { IDocumentControlTableTableProps } from './SDocumentControlTable.types';
import { STagRow } from '../../addons/addons-rows/STagRow/STagRow';

export const SDocumentControlTable: FC<IDocumentControlTableTableProps> = ({
  data = [],
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectRow,
  hiddenColumns,
  setHiddenColumns,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<DocumentControlBrowseResultModel>[] = [
    // TYPE
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.TYPE),
      header: (
        <DocumentControlHeaderRow
          setOrderBy={setOrderBy}
          justify="center"
          orderByMap={orderByMap}
          onClean={() => setFilters({ ...filters, types: [] })}
          field={DocumentControlOrderByEnum.TYPE}
          text={columnMap[columnsEnum.TYPE].label}
        />
      ),
      row: (row) => <STagRow justify="center" lineNumber={1} text={row.type} />,
    },
    // NAME
    {
      column: 'minmax(200px, 2fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.NAME),
      header: (
        <DocumentControlHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={DocumentControlOrderByEnum.NAME}
          text={columnMap[columnsEnum.NAME].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.name} />,
    },

    // DESCRIPTION
    {
      column: 'minmax(200px, 3fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.DESCRIPTION),
      header: (
        <DocumentControlHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.DESCRIPTION]: true })}
          field={DocumentControlOrderByEnum.DESCRIPTION}
          text={columnMap[columnsEnum.DESCRIPTION].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.description || '-'} />,
    },

    // START DATE
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.START_DATE),
      header: (
        <DocumentControlHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          justify="center"
          onHidden={() => setHiddenColumns({ [columnsEnum.START_DATE]: true })}
          field={DocumentControlOrderByEnum.START_DATE}
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
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.END_DATE),
      header: (
        <DocumentControlHeaderRow
          setOrderBy={setOrderBy}
          justify="center"
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.END_DATE]: true })}
          field={DocumentControlOrderByEnum.END_DATE}
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
    // CREATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <DocumentControlHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={DocumentControlOrderByEnum.CREATED_AT}
          onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_AT]: true })}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formatedCreatedAt} />,
    },
    // UPDATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.UPDATED_AT),
      header: (
        <DocumentControlHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
          field={DocumentControlOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formatedUpdatedAt} />,
    },
    // FILE
    {
      column: '120px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.FILE),
      header: (
        <DocumentControlHeaderRow
          justify="center"
          text={columnMap[columnsEnum.FILE].label}
        />
      ),
      row: (row) => <SDownloadRow url={row.file?.url} />,
    },
  ];

  return (
    <>
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
      <STablePagination
        isLoading={isLoading}
        total={pagination?.total}
        limit={pagination?.limit}
        page={pagination?.page}
        setPage={setPage}
      />
    </>
  );
};
