import { FC } from 'react';

import { commentTextTypeTranslation } from '@v2/models/security/translations/comment-text-type.translation';
import { SSelectHRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectRow';
import { STagRow } from '../../addons/addons-rows/STagRow/STagRow';
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
import { DocumentControlOrderByEnum } from '@v2/services/enterprise/document-control/document-control/browse-document-control/service/browse-document-control.types';
import { DocumentControlBrowseResultModel } from '@v2/models/enterprise/models/document-control/document-control/document-control-browse-result.model';

export const SDocumentControlTable: FC<IDocumentControlTableTableProps> = ({
  companyId,
  data = [],
  table,
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectRow,
  hiddenColumns,
  filterColumns,
  setHiddenColumns,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<DocumentControlBrowseResultModel>[] = [
    // NAME
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.NAME),
      header: (
        <DocumentControlHeaderRow
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.NAME]: true })}
          text={columnMap[columnsEnum.NAME].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.name} />,
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
