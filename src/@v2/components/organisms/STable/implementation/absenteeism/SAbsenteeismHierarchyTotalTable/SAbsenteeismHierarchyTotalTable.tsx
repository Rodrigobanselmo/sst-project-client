import { FC } from 'react';

import { AbsenteeismTotalHierarchyResultBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-hierarchy/absenteeism-total-hierarchy-browse-result.model';
import {
  AbsenteeismHierarchyTotalOrderByEnum,
  AbsenteeismHierarchyTypeEnum,
} from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
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
import { getHiddenColumn } from './helpers/get-hidden-column';
import { AbsenteeismColumnMap as columnMap } from './maps/absenteeism-column-map';
import { IAbsenteeismTableProps } from './SAbsenteeismHierarchyTotalTable.types';
import { STextClickRow } from '../../../addons/addons-rows/STextClickRow/STextClickRow';

export const SAbsenteeismHierarchyTotalTable: FC<IAbsenteeismTableProps> = ({
  data,
  filters,
  setFilters,
  isLoading,
  pagination,
  setPage,
  setOrderBy,
  onSelectColumn,
  filterColumns,
  showPagination = true,
}) => {
  const results = data?.results || [];

  const orderByMap = mapOrderByTable(filters.orderBy);

  const tableRows: ITableData<AbsenteeismTotalHierarchyResultBrowseModel>[] = [
    // TAXA
    {
      column: '80px',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          justify="center"
          field={AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS}
          setOrderBy={setOrderBy}
          text={columnMap[columnsEnum.AVARAGE_DAYS].label}
        />
      ),
      row: (row) => (
        <STextRow
          justify="center"
          fontSize={13}
          lineNumber={2}
          text={String(row.rate) + '%'}
        />
      ),
    },
    // TOTAL DAYS
    {
      column: '60px',
      header: (
        <AbsenteeismHeaderRow
          justify="center"
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          field={AbsenteeismHierarchyTotalOrderByEnum.TOTAL_DAYS}
          text={columnMap[columnsEnum.TOTAL_DAYS].label}
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
      column: '60px',
      header: (
        <AbsenteeismHeaderRow
          setOrderBy={setOrderBy}
          orderByMap={orderByMap}
          justify="center"
          field={AbsenteeismHierarchyTotalOrderByEnum.TOTAL}
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

  if (data?.typeMap.OFFICE) {
    tableRows.unshift({
      column: 'minmax(150px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.OFFICE].label}
        />
      ),
      row: (row) => (
        <STextClickRow
          fontSize={13}
          onClick={() =>
            onSelectColumn({
              id: row.OFFICE!.id,
              type: AbsenteeismHierarchyTypeEnum.OFFICE,
            })
          }
          tooltipMinLength={40}
          lineNumber={2}
          text={row.OFFICE?.name}
        />
      ),
    });
  }

  if (data?.typeMap?.SECTOR) {
    tableRows.unshift({
      column: 'minmax(150px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.SECTOR].label}
        />
      ),
      row: (row) => (
        <STextClickRow
          fontSize={13}
          onClick={() =>
            onSelectColumn({
              id: row.SECTOR!.id,
              type: AbsenteeismHierarchyTypeEnum.SECTOR,
            })
          }
          tooltipMinLength={40}
          lineNumber={2}
          text={row.SECTOR?.name}
        />
      ),
    });
  }

  if (data?.typeMap?.MANAGEMENT) {
    tableRows.unshift({
      column: 'minmax(100px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.MANAGEMENT].label}
        />
      ),
      row: (row) =>
        row.MANAGEMENT ? (
          <STextClickRow
            fontSize={13}
            onClick={() =>
              onSelectColumn({
                id: row.MANAGEMENT!.id,
                type: AbsenteeismHierarchyTypeEnum.MANAGEMENT,
              })
            }
            tooltipMinLength={20}
            lineNumber={2}
            text={row.MANAGEMENT.name}
          />
        ) : (
          <div />
        ),
    });
  }

  if (data?.typeMap?.DIRECTORY) {
    tableRows.unshift({
      column: 'minmax(125px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.DIRECTORY].label}
        />
      ),
      row: (row) =>
        row.DIRECTORY ? (
          <STextClickRow
            fontSize={13}
            onClick={() =>
              onSelectColumn({
                id: row.DIRECTORY!.id,
                type: AbsenteeismHierarchyTypeEnum.DIRECTORY,
              })
            }
            tooltipMinLength={20}
            lineNumber={2}
            text={row.DIRECTORY?.name}
          />
        ) : (
          <div />
        ),
    });
  }

  if (data?.typeMap?.WORKSPACE) {
    tableRows.unshift({
      column: 'minmax(120px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.WORKSPACE].label}
        />
      ),
      row: (row) => (
        <STextClickRow
          fontSize={13}
          onClick={() =>
            onSelectColumn({
              id: row.WORKSPACE!.id,
              type: AbsenteeismHierarchyTypeEnum.WORKSPACE,
            })
          }
          tooltipMinLength={20}
          lineNumber={2}
          text={row.WORKSPACE?.name}
        />
      ),
    });
  }

  if (data?.typeMap?.HOMOGENEOUS_GROUP) {
    tableRows.unshift({
      column: 'minmax(120px, 1fr)',
      header: (
        <AbsenteeismHeaderRow
          orderByMap={orderByMap}
          text={columnMap[columnsEnum.HOMOGENEOUS_GROUP].label}
        />
      ),
      row: (row) => (
        <STextClickRow
          fontSize={13}
          onClick={() =>
            onSelectColumn({
              id: row.HOMOGENEOUS_GROUP!.id,
              type: AbsenteeismHierarchyTypeEnum.HOMOGENEOUS_GROUP,
            })
          }
          tooltipMinLength={20}
          lineNumber={2}
          text={row.HOMOGENEOUS_GROUP?.name || 'Sem Grupo'}
        />
      ),
    });
  }

  const hidePagination =
    !showPagination && results.length <= (pagination?.limit || 0);

  return (
    <>
      <STable
        isLoadingMore={isLoading}
        table={tableRows}
        data={results}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data, rows }) => (
          <STableBody
            rows={data}
            renderRow={(row, index) => {
              return (
                <STableRow schema="grey" key={index} minHeight={35}>
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
