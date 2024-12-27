import { FC } from 'react';

import { CommentBrowseResultModel } from '@v2/models/security/models/comment/comment-browse-result.model';
import { CommentOrderByEnum } from '@v2/services/security/action-plan/comment/browse-comments/service/browse-action-plan.types';
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
import { CommentHeaderRow } from './components/CommentHeaderRow/CommentHeaderRow';
import { CommentColumnsEnum as columnsEnum } from './enums/comment-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { CommentColumnMap as columnMap } from './maps/comment-column-map';
import { ICommentTableTableProps } from './SCommentTable.types';
import { CommentApproveSelect } from './components/CommentApproveSelect/CommentApproveSelect';
import { commentTextTypeTranslation } from '@v2/models/security/translations/comment-text-type.translation';
import { STagRow } from '../../addons/addons-rows/STagRow/STagRow';
import { commentTypeTranslation } from '@v2/models/security/translations/comment-type.translation';
import { Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';

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
    // TYPE CHANGES
    {
      column: '180px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHANGES),
      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          setOrderBy={setOrderBy}
          justify="center"
          field={CommentOrderByEnum.TYPE}
          onHidden={() => setHiddenColumns({ [columnsEnum.CHANGES]: true })}
          text={columnMap[columnsEnum.CHANGES].label}
        />
      ),
      row: (row) => {
        const color = row.isCanceled
          ? 'error.dark'
          : row.isDone
          ? 'success.dark'
          : 'warning.dark';

        return (
          <STagRow
            borderColor={color}
            color={color}
            text={row.formatedChanges}
          />
        );
      },
    },
    // CREATED BY
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_BY),
      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          setOrderBy={setOrderBy}
          justify="center"
          field={CommentOrderByEnum.CREATOR}
          onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_BY]: true })}
          text={columnMap[columnsEnum.CREATED_BY].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          text={row.createdBy?.name}
          // bottomText={row.createdBy?.email}
          tooltipMinLength={20}
        />
      ),
    },
    // TYPE TEXT
    {
      column: '110px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.TEXT_TYPE),
      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          setOrderBy={setOrderBy}
          justify="center"
          field={CommentOrderByEnum.TEXT_TYPE}
          onHidden={() => setHiddenColumns({ [columnsEnum.TEXT_TYPE]: true })}
          text={columnMap[columnsEnum.TEXT_TYPE].label}
        />
      ),
      row: (row) => (
        <STagRow
          text={row.textType ? commentTextTypeTranslation[row.textType] : '-'}
        />
      ),
    },
    // ORIGIN
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ORIGIN),
      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.ORIGIN]: true })}
          text={columnMap[columnsEnum.ORIGIN].label}
        />
      ),
      row: (row) => (
        <STextRow
          lineNumber={2}
          text={`${row.origin.name} (${row.originType})`}
        />
      ),
    },
    // RECCOMENDATION
    {
      column: '1fr',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RECCOMENDATION),
      header: (
        <CommentHeaderRow
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ [columnsEnum.RECCOMENDATION]: true })
          }
          text={columnMap[columnsEnum.RECCOMENDATION].label}
        />
      ),
      row: (row) => <STextRow lineNumber={3} text={row.recommendation.name} />,
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
      row: (row) => <STextRow lineNumber={3} text={row.text} />,
    },
    // APPROVED
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.APPROVED),
      header: (
        <CommentHeaderRow
          justify="center"
          orderByMap={orderByMap}
          setOrderBy={setOrderBy}
          field={CommentOrderByEnum.IS_APPROVED}
          onHidden={() => setHiddenColumns({ [columnsEnum.APPROVED]: true })}
          text={columnMap[columnsEnum.APPROVED].label}
        />
      ),
      row: (row) => <CommentApproveSelect companyId={companyId} row={row} />,
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
                  <Box
                    gridColumn="1/-1"
                    display="flex"
                    gap={2}
                    borderTop={1}
                    borderColor="grey.500"
                    px={4}
                    ml={14}
                    py={1}
                    mb={-7}
                  >
                    <SText fontSize={12}>Origem:</SText>
                    <SText fontSize={12} color="text.light">
                      {row.origin.name} ({row.originType})
                    </SText>
                  </Box>
                  <Box
                    gridColumn="1/-1"
                    display="flex"
                    gap={2}
                    px={4}
                    ml={14}
                    py={1}
                  >
                    <SText fontSize={12}>Recomendação:</SText>
                    <SText fontSize={12} color="text.light">
                      {row.recommendation.name}
                    </SText>
                  </Box>
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
