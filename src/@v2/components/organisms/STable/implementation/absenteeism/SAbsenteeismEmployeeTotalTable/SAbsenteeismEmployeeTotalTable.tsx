import { FC } from 'react';

import { AbsenteeismTotalEmployeeResultBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-employee/absenteeism-total-employee-browse-result.model';
import { AbsenteeismEmployeeTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-employee/service/browse-absenteeism-employee.service';
import { STableHeader } from 'components/atoms/STable';
import { STextRow } from '../../../addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '../../../addons/addons-table/STablePagination/STablePagination';
import { STable } from '../../../common/STable/STable';
import { ITableData } from '../../../common/STable/STable.types';
import { STableBody } from '../../../common/STableBody/STableBody';
import { STableRow } from '../../../common/STableRow/STableRow';
import { mapOrderByTable } from '../../../helpers/map-order-by-table.helper';
import { AbsenteeismHeaderRow } from './components/AbsenteeismHeaderRow/AbsenteeismHeaderRow';
import { AbsenteeismColumnsEnum as columnsEnum } from './enums/absenteeism-columns.enum';
import { AbsenteeismColumnMap as columnMap } from './maps/absenteeism-column-map';
import { IAbsenteeismTableProps } from './SAbsenteeismEmployeeTotalTable.types';

export const SAbsenteeismEmployeeTotalTable: FC<IAbsenteeismTableProps> = ({
  data = [],
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectRow,
  filterColumns,
  showPagination = true,
}) => {
  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<AbsenteeismTotalEmployeeResultBrowseModel>[] = [
    // NAME
    {
      column: 'minmax(200px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          field={AbsenteeismEmployeeTotalOrderByEnum.NAME}
          text={columnMap[columnsEnum.NAME].label}
          setOrderBy={setOrderBy}
        />
      ),
      row: (row) => (
        <STextRow
          fontSize={13}
          tooltipMinLength={40}
          lineNumber={2}
          text={row.name}
        />
      ),
    },
    // TOTAL DAYS
    {
      column: '150px',
      header: (
        <AbsenteeismHeaderRow
          justify="center"
          orderByMap={orderByMap}
          field={AbsenteeismEmployeeTotalOrderByEnum.TOTAL_DAYS}
          text={columnMap[columnsEnum.TOTAL_DAYS].label}
          setOrderBy={setOrderBy}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          fontSize={13}
          lineNumber={2}
          text={String(row.totalDays)}
        />
      ),
    },
    // TOTAL
    {
      column: '150px',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          justify="center"
          field={AbsenteeismEmployeeTotalOrderByEnum.TOTAL}
          text={columnMap[columnsEnum.TOTAL].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          fontSize={13}
          lineNumber={2}
          text={String(row.total)}
        />
      ),
    },
  ];

  const hidePagination =
    !showPagination && data.length <= (pagination?.limit || 0);

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
                  schema="grey"
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
