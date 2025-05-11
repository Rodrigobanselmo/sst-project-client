import { FC } from 'react';

import { TaskBrowseResultModel } from '@v2/models/tasks/models/task/task-browse-result.model';
import { TaskOrderByEnum } from '@v2/services/tasks/task/browse-task/service/browse-task.service';
import { SSelectHRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectHRow';
import { SSelectRow } from '../../addons/addons-rows/SCheckSelectFullRow/SCheckSelectRow';
import { SStatusButtonRow } from '../../addons/addons-rows/SStatusButtonRow/SStatusButtonRow';
import { STextCopyRow } from '../../addons/addons-rows/STextCopyRow/STextCopyRow';
import { STextRow } from '../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../common/STable/STable';
import { ITableData } from '../../common/STable/STable.types';
import { STableBody } from '../../common/STableBody/STableBody';
import { STableRow } from '../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../helpers/map-order-by-table.helper';
import { TaskHeaderRow } from './components/TaskHeaderRow/TaskHeaderRow';
import { TaskPriorityTag } from './components/TaskPriorityTag/TaskPriorityTag';
import { TaskResponsibleSelect } from './components/TaskResponsibleSelect/TaskResponsibleSelect';
import { TaskValidDateSelect } from './components/TaskValidDateSelect/TaskValidDateSelect';
import { TaskColumnsEnum as columnsEnum } from './enums/task-columns.enum';
import { getHiddenColumn } from './helpers/get-hidden-column';
import { TaskColumnMap as columnMap } from './maps/task-column-map';
import { ITaskTableProps } from './STaskTable.types';
import { STableHeader } from 'components/atoms/STable';

export const STaskTable: FC<ITaskTableProps> = ({
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
  statusButtonProps,
  onEditStatus,
  showPagination = true,
  options,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<TaskBrowseResultModel>[] = [
    // CHECK_BOX
    {
      column: '20px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CHECK_BOX),
      header: (
        <SSelectHRow table={table} ids={data.map((row) => String(row.id))} />
      ),
      row: (row) => <SSelectRow table={table} id={String(row.id)} />,
    },
    // ID
    {
      column: '35px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.ID),
      header: (
        <TaskHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.ID].label}
        />
      ),
      row: (row) => (
        <STextCopyRow
          fontSize={13}
          lineNumber={1}
          text={String(row.sequentialId)}
        />
      ),
    },
    // DESCRIPTION
    {
      column: 'minmax(200px, 1fr)',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.DESCRIPTION),
      header: (
        <TaskHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={TaskOrderByEnum.DESCRIPTION}
          text={columnMap[columnsEnum.DESCRIPTION].label}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          tooltipMinLength={40}
          lineNumber={2}
          text={row.description}
        />
      ),
    },
    // PRIORITY
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.PRIORITY),
      header: (
        <TaskHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.PRIORITY]: true })}
          field={TaskOrderByEnum.PRIORITY}
          text={columnMap[columnsEnum.PRIORITY].label}
        />
      ),
      row: (row) => <TaskPriorityTag priority={row.priority} />,
    },
    // STATUS
    {
      column: '180px',
      hidden: hiddenColumns[columnsEnum.STATUS],
      header: (
        <TaskHeaderRow
          justify="center"
          isFiltered={!!filters.statusIds?.length}
          onClean={() => setFilters({ ...filters, statusIds: [] })}
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() =>
            setHiddenColumns({ ...hiddenColumns, [columnsEnum.STATUS]: true })
          }
          filters={filterColumns[columnsEnum.STATUS]}
          field={TaskOrderByEnum.STATUS}
          text={columnMap[columnsEnum.STATUS].label}
        />
      ),
      row: (row) => (
        <SStatusButtonRow
          label={row.status?.name || '-'}
          color={row.status?.color}
          popperStatusProps={{
            ...statusButtonProps,
            onSelect: (id) => onEditStatus(id, row),
          }}
        />
      ),
    },
    // RESPONSIBLE
    {
      column: '150px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.RESPONSIBLE),
      header: (
        <TaskHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.RESPONSIBLE]: true })}
          field={TaskOrderByEnum.RESPONSIBLE}
          text={columnMap[columnsEnum.RESPONSIBLE].label}
        />
      ),
      row: (row) => <TaskResponsibleSelect companyId={companyId} row={row} />,
    },
    // CREATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.CREATED_AT),
      header: (
        <TaskHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.CREATED_AT]: true })}
          field={TaskOrderByEnum.CREATED_AT}
          text={columnMap[columnsEnum.CREATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formattedCreatedAt} />,
    },
    // UPDATED_AT
    {
      column: '100px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.UPDATED_AT),
      header: (
        <TaskHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.UPDATED_AT]: true })}
          field={TaskOrderByEnum.UPDATED_AT}
          text={columnMap[columnsEnum.UPDATED_AT].label}
        />
      ),
      row: (row) => <STextRow justify="center" text={row.formattedUpdatedAt} />,
    },
    // END_DATE
    {
      column: '170px',
      hidden: getHiddenColumn(hiddenColumns, columnsEnum.END_DATE),
      header: (
        <TaskHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          onHidden={() => setHiddenColumns({ [columnsEnum.END_DATE]: true })}
          field={TaskOrderByEnum.END_DATE}
          text={columnMap[columnsEnum.END_DATE].label}
        />
      ),
      row: (row) => <TaskValidDateSelect row={row} companyId={companyId} />,
    },
    ...(options?.endRows || []),
  ];

  if (options?.hideSelection) {
    tableRows[0] = {
      column: '20px',
      header: null,
      row: (row) => <div />,
    };
  }

  const hidePagination =
    !showPagination && data.length <= (pagination?.limit || 0);

  return (
    <>
      <STable
        isLoadingMore={isLoading}
        table={tableRows}
        data={data}
        renderHeader={(headers) =>
          options?.hideHeader ? null : <STableHeader>{headers}</STableHeader>
        }
        renderBody={({ data, rows }) => (
          <STableBody
            rows={data}
            hideEmpty={options?.hideEmpty}
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
      {!hidePagination && (
        <STablePagination
          isLoading={isLoading}
          total={pagination?.total}
          limit={pagination?.limit}
          page={pagination?.page}
          setPage={setPage}
        />
      )}
    </>
  );
};
