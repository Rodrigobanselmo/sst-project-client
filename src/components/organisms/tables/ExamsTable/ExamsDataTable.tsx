import { FC, ReactNode } from 'react';

import { Chip, IconButton } from '@mui/material';
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

import EditIcon from 'assets/icons/SEditIcon';

import { IExam } from 'core/interfaces/api/IExam';
import { StatusEnum } from 'project/enum/status.enum';

import { ExamColumnEnum, examColumnMap } from './exam-columns';
import {
  getExamOriginChipSx,
  getExamOriginLabel,
  normalizeExamOrigin,
} from './exam-origin.constants';

export type ExamOrderBy = {
  field: ExamColumnEnum;
  order: 'asc' | 'desc';
};

type Props = {
  data: IExam[];
  isLoading?: boolean;
  hiddenColumns: Record<string, boolean>;
  orderBy: ExamOrderBy | null;
  onOrderBy: (field: ExamColumnEnum) => void;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onEditExam: (exam: IExam) => void;
};

const STATUS_LABELS: Partial<Record<StatusEnum, string>> = {
  [StatusEnum.ACTIVE]: 'Ativo',
  [StatusEnum.INACTIVE]: 'Inativo',
  [StatusEnum.PENDING]: 'Pendente',
  [StatusEnum.PROGRESS]: 'Em progresso',
  [StatusEnum.CANCELED]: 'Cancelado',
};

const statusChipColor = (status: StatusEnum) =>
  status === StatusEnum.ACTIVE ? 'success' : 'default';

const isColumnHidden = (
  hiddenColumns: Record<string, boolean>,
  column: ExamColumnEnum,
) => {
  const { startHidden } = examColumnMap[column];
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

export const ExamsDataTable: FC<Props> = ({
  data,
  isLoading,
  hiddenColumns,
  orderBy,
  onOrderBy,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onEditExam,
}) => {
  const directionFor = (column: ExamColumnEnum) =>
    orderBy?.field === column ? orderBy.order : undefined;

  const header = (
    column: ExamColumnEnum,
    justify?: 'flex-start' | 'center' | 'flex-end',
  ): ReactNode => {
    const { label, sortable } = examColumnMap[column];
    return (
      <SortableHeader
        label={label}
        justify={justify}
        direction={directionFor(column)}
        onSort={sortable ? () => onOrderBy(column) : undefined}
      />
    );
  };

  const tableData: ITableData<IExam>[] = [
    {
      column: 'minmax(220px, 3fr)',
      hidden: isColumnHidden(hiddenColumns, ExamColumnEnum.NAME),
      header: header(ExamColumnEnum.NAME),
      row: (row) => (
        <STextRow text={row.name || '-'} tooltipMinLength={28} lineNumber={2} />
      ),
    },
    {
      column: 'minmax(160px, 2fr)',
      hidden: isColumnHidden(hiddenColumns, ExamColumnEnum.ANALYSES),
      header: header(ExamColumnEnum.ANALYSES),
      row: (row) => (
        <STextRow text={row.analyses || '-'} tooltipMinLength={28} lineNumber={2} />
      ),
    },
    {
      column: 'minmax(140px, 2fr)',
      hidden: isColumnHidden(hiddenColumns, ExamColumnEnum.MATERIAL),
      header: header(ExamColumnEnum.MATERIAL),
      row: (row) => (
        <STextRow text={row.material || '-'} tooltipMinLength={28} lineNumber={2} />
      ),
    },
    {
      column: '130px',
      hidden: isColumnHidden(hiddenColumns, ExamColumnEnum.ORIGIN),
      header: header(ExamColumnEnum.ORIGIN, 'center'),
      row: (row) => {
        const origin = normalizeExamOrigin(row.origin);
        return (
          <STextRow
            justify="center"
            startAddon={
              <Chip
                size="small"
                label={getExamOriginLabel(row.origin)}
                sx={getExamOriginChipSx(origin)}
              />
            }
            text=""
            lineNumber={1}
          />
        );
      },
    },
    {
      column: '120px',
      hidden: isColumnHidden(hiddenColumns, ExamColumnEnum.STATUS),
      header: header(ExamColumnEnum.STATUS, 'center'),
      row: (row) => {
        const status = row.status ?? StatusEnum.ACTIVE;
        return (
          <STextRow
            justify="center"
            startAddon={
              <Chip
                size="small"
                variant="filled"
                label={STATUS_LABELS[status] ?? status}
                color={statusChipColor(status)}
                sx={{ fontWeight: 600 }}
              />
            }
            text=""
            lineNumber={1}
          />
        );
      },
    },
    {
      column: '70px',
      header: <STableHRow justify="center">Editar</STableHRow>,
      row: (row) => (
        <STextRow
          justify="center"
          startAddon={
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEditExam(row);
              }}
            >
              <EditIcon />
            </IconButton>
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
            contentEmpty="Nenhum exame encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow
                key={row.id}
                clickable
                minHeight={35}
                onClick={() => onEditExam(row)}
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
