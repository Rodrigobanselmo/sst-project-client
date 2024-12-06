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
// import { CommentColumnMap as columnMap } from './maps/action-plan-column-map';

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
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<CommentBrowseResultModel>[] = [
    // CHECK_BOX
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: <SSelectHRow table={table} ids={data.map((row) => row.id)} />,
      row: (row) => <SSelectRow table={table} id={row.id} />,
    },
    // ORIGIN
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ORIGIN),
      header: (
        <CommentHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={CommentOrderByEnum.ORIGIN}
          text={columnMap[columnsEnum.ORIGIN].label}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          tooltipMinLength={20}
          lineNumber={1}
          text={row.origin.name}
          bottomText={row.originType}
        />
      ),
    },
    // RISK
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RISK),
      header: (
        <CommentHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.RISK]: true })}
          field={CommentOrderByEnum.RISK}
          text={columnMap[columnsEnum.RISK].label}
        />
      ),
      row: (row) => (
        <STextRow
          text={row.risk.name}
          tooltipMinLength={20}
          startAddon={<SRiskChip type={row.risk.type} />}
        />
      ),
    },
    // GENERATE_SOURCE
    {
      column: '200px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.GENERATE_SOURCE),
      header: (
        <CommentHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.GENERATE_SOURCE]: true })
          }
          text={columnMap[columnsEnum.GENERATE_SOURCE].label}
        />
      ),
      row: (row) => <STextRow text={row.generateSourceNames} />,
    },
    // LEVEL
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.LEVEL),
      header: (
        <CommentHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.LEVEL]: true })}
          field={CommentOrderByEnum.LEVEL}
          text={columnMap[columnsEnum.LEVEL].label}
        />
      ),
      row: (row) => <SOcupationalRiskTag level={row.ocupationalRisk} />,
    },
    // RECOMMENDATION
    {
      column: 'minmax(230px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RECOMMENDATION),
      header: (
        <CommentHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.RECOMMENDATION]: true })
          }
          field={CommentOrderByEnum.RECOMMENDATION}
          text={columnMap[columnsEnum.RECOMMENDATION].label}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          tooltipMinLength={30}
          lineNumber={2}
          text={row.recommendation.name}
        />
      ),
    },
    // STATUS
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.STATUS),
      header: (
        <CommentHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.STATUS]: true })}
          field={CommentOrderByEnum.STATUS}
          text={columnMap[columnsEnum.STATUS].label}
        />
      ),
      row: (row) => <CommentStatusSelect companyId={companyId} row={row} />,
    },
    // RESPONSIBLE
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RESPONSIBLE),
      header: (
        <CommentHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.RESPONSIBLE]: true })}
          field={CommentOrderByEnum.RESPONSIBLE}
          text={columnMap[columnsEnum.RESPONSIBLE].label}
        />
      ),
      row: (row) => (
        <CommentResponsibleSelect companyId={companyId} row={row} />
      ),
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
          onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_AT]: true })}
          field={CommentOrderByEnum.CREATED_AT}
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
    // VALID_DATE
    {
      column: '170px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.VALID_DATE),
      header: (
        <CommentHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.VALID_DATE]: true })}
          field={CommentOrderByEnum.VALID_DATE}
          text={columnMap[columnsEnum.VALID_DATE].label}
        />
      ),
      row: (row) => <CommentValidDateSelect row={row} companyId={companyId} />,
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
