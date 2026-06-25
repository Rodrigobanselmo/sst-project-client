import { FC, ReactNode } from 'react';

import { SIconSortArrowDown } from '@v2/assets/icons/SIconSortArrowDown/SIconSortArrowDown';
import { SIconSortArrowUp } from '@v2/assets/icons/SIconSortArrowUp/SIconSortArrowUp';
import { SIconUnfolderMore } from '@v2/assets/icons/SIconUnfolderMore/SIconUnfolderMore';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { EsocialTable27Item } from '@v2/services/esocial/esocial-table-27/service/esocial-table-27.types';

import {
  EsocialTable27ColumnEnum,
  esocialTable27ColumnMap,
  EsocialTable27OrderBy,
} from '../esocial-table-27-columns';

type Props = {
  data: EsocialTable27Item[];
  isLoading?: boolean;
  hiddenColumns: Record<string, boolean>;
  orderBy: EsocialTable27OrderBy | null;
  onOrderBy: (field: EsocialTable27ColumnEnum) => void;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
};

const isColumnHidden = (
  hiddenColumns: Record<string, boolean>,
  column: EsocialTable27ColumnEnum,
) => {
  const { startHidden } = esocialTable27ColumnMap[column];
  return column in hiddenColumns ? hiddenColumns[column] : Boolean(startHidden);
};

const SortableHeader: FC<{
  label: string;
  justify?: 'flex-start' | 'center' | 'flex-end';
  direction?: 'asc' | 'desc';
  onSort?: () => void;
}> = ({ label, justify, direction, onSort }) => (
  <STableHRow
    clickable={Boolean(onSort)}
    justify={justify}
    boxProps={onSort ? { onClick: onSort } : undefined}
  >
    {label}
    {onSort && !direction && <SIconUnfolderMore />}
    {direction === 'desc' && <SIconSortArrowUp color="primary.main" />}
    {direction === 'asc' && <SIconSortArrowDown color="primary.main" />}
  </STableHRow>
);

export const ESocialTable27Table: FC<Props> = ({
  data,
  isLoading,
  hiddenColumns,
  orderBy,
  onOrderBy,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const directionFor = (column: EsocialTable27ColumnEnum) =>
    orderBy?.field === column ? orderBy.order : undefined;

  const header = (
    column: EsocialTable27ColumnEnum,
    justify?: 'flex-start' | 'center' | 'flex-end',
  ): ReactNode => {
    const { label, sortable } = esocialTable27ColumnMap[column];
    return (
      <SortableHeader
        label={label}
        justify={justify}
        direction={directionFor(column)}
        onSort={sortable ? () => onOrderBy(column) : undefined}
      />
    );
  };

  const tableData: ITableData<EsocialTable27Item>[] = [
    {
      column: '140px',
      hidden: isColumnHidden(hiddenColumns, EsocialTable27ColumnEnum.CODE),
      header: header(EsocialTable27ColumnEnum.CODE),
      row: (row) => <STextRow text={row.code} lineNumber={1} />,
    },
    {
      column: 'minmax(280px, 1fr)',
      hidden: isColumnHidden(hiddenColumns, EsocialTable27ColumnEnum.NAME),
      header: header(EsocialTable27ColumnEnum.NAME),
      row: (row) => (
        <STextRow text={row.name} tooltipMinLength={40} lineNumber={2} />
      ),
    },
  ];

  return (
    <>
      <STable
        isLoading={isLoading}
        table={tableData}
        data={data}
        renderHeader={(headers) => <STableHeader>{headers}</STableHeader>}
        renderBody={({ data: rowsData, rows }) => (
          <STableBody
            rows={rowsData}
            contentEmpty="Nenhum procedimento encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.code} minHeight={35}>
                {rows.map((render) => render(row))}
              </STableRow>
            )}
          />
        )}
      />
      <STablePagination
        isLoading={isLoading}
        total={pagination.total}
        limit={pagination.limit}
        page={pagination.page}
        setPage={setPage}
        pageSizeOptions={pageSizeOptions}
        onPageSizeChange={onPageSizeChange}
      />
    </>
  );
};
