import { FC } from 'react';

import { SOcupationalRiskTag } from '@v2/components/molecules/SOcupationalRiskTag/SOcupationalRiskTag';
import { SRiskChip } from '@v2/components/molecules/SRiskChip/SRiskChip';
import { SSelectHRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableHeader } from '../../common/STableHeader/STableHeader';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { CommentColumnsEnum as columnsEnum } from './enums/comment-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { ICommentTableTableProps } from './SCommentTable.types';
import { CommentBrowseResultModel } from '@v2/models/security/models/comment/comment-browse-result.model';
import { CommentColumnMap as columnMap } from './maps/comment-column-map';
import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';
import { CommentHeaderRow } from './components/CommentHeaderRow/CommentHeaderRow';

export const SCommentTable: FC<ICommentTableTableProps> = ({
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
  console.log(11, { data });
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<CommentBrowseResultModel>[] = [
    // CHECK_BOX
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
    // APPROVED
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.APPROVED),

      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          field={CommentOrderByEnum.CREATED_AT}
          onHidden={() => setHiddenColumns({ [columnsEnum.APPROVED]: true })}
          text={columnMap[columnsEnum.APPROVED].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.text} />,
    },
    // TEXT
    {
      column: '1fr',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.TEXT),
      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.TEXT]: true })}
          text={columnMap[columnsEnum.TEXT].label}
        />
      ),
      row: (row) => <STextRow lineNumber={2} text={row.text} />,
    },
    // CREATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <CommentHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CommentOrderByEnum.CREATED_AT}
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
        <CommentHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
          field={CommentOrderByEnum.UPDATED_AT}
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
