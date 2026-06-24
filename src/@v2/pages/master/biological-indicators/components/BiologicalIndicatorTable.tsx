import { FC, ReactNode } from 'react';

import { Chip } from '@mui/material';
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
import type {
  BiologicalIndicatorListItem,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';

import {
  BIOLOGICAL_INDICATOR_STATUS_LABELS,
  BIOLOGICAL_INDICATOR_TABLE_LABELS,
  BIOLOGICAL_INDICATOR_TYPE_LABELS,
  getStatusChipColor,
} from '../biological-indicator-labels.util';
import {
  BiologicalIndicatorColumnEnum,
  biologicalIndicatorColumnMap,
} from './biological-indicator-columns';

export type BiologicalIndicatorOrderBy = {
  field: BiologicalIndicatorColumnEnum;
  order: 'asc' | 'desc';
};

type Props = {
  data: BiologicalIndicatorListItem[];
  isLoading?: boolean;
  hiddenColumns: Record<string, boolean>;
  orderBy: BiologicalIndicatorOrderBy | null;
  onOrderBy: (field: BiologicalIndicatorColumnEnum) => void;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onSelectRow: (row: BiologicalIndicatorListItem) => void;
};

const isColumnHidden = (
  hiddenColumns: Record<string, boolean>,
  column: BiologicalIndicatorColumnEnum,
) => {
  const { startHidden } = biologicalIndicatorColumnMap[column];
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

const getConfirmedRiskLabel = (row: BiologicalIndicatorListItem) => {
  const confirmed = row.riskLinks.find((link) => link.isConfirmed);
  return (
    confirmed?.riskFactor?.name ??
    confirmed?.riskNameSnapshot ??
    row.riskLinks[0]?.riskFactor?.name ??
    '—'
  );
};

const getConfirmedExamLabel = (row: BiologicalIndicatorListItem) => {
  const confirmed = row.examLinks.find((link) => link.isConfirmed);
  return confirmed?.exam?.name ?? confirmed?.examNameSnapshot ?? '—';
};

export const BiologicalIndicatorTable: FC<Props> = ({
  data,
  isLoading,
  hiddenColumns,
  orderBy,
  onOrderBy,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onSelectRow,
}) => {
  const directionFor = (column: BiologicalIndicatorColumnEnum) =>
    orderBy?.field === column ? orderBy.order : undefined;

  const header = (
    column: BiologicalIndicatorColumnEnum,
    justify?: 'flex-start' | 'center' | 'flex-end',
  ): ReactNode => {
    const { label, sortable } = biologicalIndicatorColumnMap[column];
    return (
      <SortableHeader
        label={label}
        justify={justify}
        direction={directionFor(column)}
        onSort={sortable ? () => onOrderBy(column) : undefined}
      />
    );
  };

  const tableData: ITableData<BiologicalIndicatorListItem>[] = [
    {
      column: 'minmax(200px, 1.4fr)',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.SUBSTANCE),
      header: header(BiologicalIndicatorColumnEnum.SUBSTANCE),
      row: (row) => (
        <STextRow text={row.substanceName} tooltipMinLength={24} lineNumber={2} />
      ),
    },
    {
      column: 'minmax(120px, 0.8fr)',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.CAS),
      header: header(BiologicalIndicatorColumnEnum.CAS),
      row: (row) => (
        <STextRow
          text={row.casPrimary ?? (row.casNumbers.join(', ') || '—')}
          lineNumber={1}
        />
      ),
    },
    {
      column: 'minmax(190px, 1.2fr)',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.INDICATOR),
      header: header(BiologicalIndicatorColumnEnum.INDICATOR),
      row: (row) => (
        <STextRow
          text={row.biologicalIndicatorOriginal}
          tooltipMinLength={24}
          lineNumber={2}
        />
      ),
    },
    {
      column: '120px',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.MATRIX),
      header: header(BiologicalIndicatorColumnEnum.MATRIX),
      row: (row) => <STextRow text={row.biologicalMatrix} lineNumber={1} />,
    },
    {
      column: '150px',
      hidden: isColumnHidden(
        hiddenColumns,
        BiologicalIndicatorColumnEnum.COLLECTION_MOMENT,
      ),
      header: header(BiologicalIndicatorColumnEnum.COLLECTION_MOMENT),
      row: (row) => <STextRow text={row.collectionMoment} lineNumber={2} />,
    },
    {
      column: '110px',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.TABLE),
      header: header(BiologicalIndicatorColumnEnum.TABLE, 'center'),
      row: (row) => (
        <STextRow
          justify="center"
          text={BIOLOGICAL_INDICATOR_TABLE_LABELS[row.tableNumber]}
          lineNumber={1}
        />
      ),
    },
    {
      column: '100px',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.TYPE),
      header: header(BiologicalIndicatorColumnEnum.TYPE, 'center'),
      row: (row) => (
        <STextRow
          justify="center"
          text={BIOLOGICAL_INDICATOR_TYPE_LABELS[row.indicatorType]}
          lineNumber={1}
        />
      ),
    },
    {
      column: '130px',
      hidden: isColumnHidden(
        hiddenColumns,
        BiologicalIndicatorColumnEnum.REFERENCE_VALUE,
      ),
      header: header(BiologicalIndicatorColumnEnum.REFERENCE_VALUE),
      row: (row) => (
        <STextRow text={`${row.referenceValue} ${row.unit}`.trim()} lineNumber={2} />
      ),
    },
    {
      column: '120px',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.STATUS),
      header: header(BiologicalIndicatorColumnEnum.STATUS, 'center'),
      row: (row) => (
        <STextRow
          justify="center"
          startAddon={
            <Chip
              size="small"
              variant="filled"
              label={BIOLOGICAL_INDICATOR_STATUS_LABELS[row.status]}
              color={getStatusChipColor(row.status)}
              sx={{ fontWeight: 600 }}
            />
          }
          text=""
          lineNumber={1}
        />
      ),
    },
    {
      column: 'minmax(160px, 1fr)',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.RISK),
      header: header(BiologicalIndicatorColumnEnum.RISK),
      row: (row) => (
        <STextRow text={getConfirmedRiskLabel(row)} tooltipMinLength={24} lineNumber={2} />
      ),
    },
    {
      column: 'minmax(160px, 1fr)',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.EXAM),
      header: header(BiologicalIndicatorColumnEnum.EXAM),
      row: (row) => (
        <STextRow text={getConfirmedExamLabel(row)} tooltipMinLength={24} lineNumber={2} />
      ),
    },
    {
      column: '120px',
      hidden: isColumnHidden(hiddenColumns, BiologicalIndicatorColumnEnum.PENDENCIES),
      header: header(BiologicalIndicatorColumnEnum.PENDENCIES, 'center'),
      row: (row) => (
        <STextRow
          justify="center"
          startAddon={
            row.pendencies.length ? (
              <Chip
                size="small"
                variant="filled"
                color="warning"
                label={row.pendencies.length}
                sx={{ fontWeight: 600 }}
              />
            ) : (
              <Chip
                size="small"
                variant="filled"
                color="success"
                label="OK"
                sx={{ fontWeight: 600 }}
              />
            )
          }
          text=""
          lineNumber={1}
        />
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
            contentEmpty="Nenhum indicador encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow
                key={row.id}
                clickable
                minHeight={35}
                onClick={() => onSelectRow(row)}
              >
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
