import { FC } from 'react';

import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { IAcgihBeiIndicator } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

import {
  acgihBeiConfidenceColors,
  acgihBeiConfidenceLabels,
  acgihBeiStatusColors,
  acgihBeiStatusLabels,
} from '../acgih-bei-indicator-labels';

type Props = {
  data: IAcgihBeiIndicator[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onEdit: (item: IAcgihBeiIndicator) => void;
  onDelete: (item: IAcgihBeiIndicator) => void;
};

export const AcgihBeiIndicatorTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onEdit,
  onDelete,
}) => {
  const tableData: ITableData<IAcgihBeiIndicator>[] = [
    {
      column: 'minmax(200px, 1fr)',
      header: <STableHRow>Substância</STableHRow>,
      row: (row) => (
        <Box display="flex" flexDirection="column">
          <STextRow text={row.substanceName} lineNumber={2} />
          {row.cas && (
            <STextRow
              text={`CAS ${row.cas}`}
              fontSize={11}
              color="text.secondary"
              lineNumber={1}
            />
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(180px, 1fr)',
      header: <STableHRow>Determinante</STableHRow>,
      row: (row) => (
        <STextRow text={row.determinant ?? '—'} tooltipMinLength={30} lineNumber={2} />
      ),
    },
    {
      column: '130px',
      header: <STableHRow>Matriz</STableHRow>,
      row: (row) => <STextRow text={row.biologicalMatrix ?? '—'} lineNumber={2} />,
    },
    {
      column: '150px',
      header: <STableHRow>BEI</STableHRow>,
      row: (row) => (
        <STextRow
          text={
            row.beiValue
              ? `${row.beiValue}${row.unit ? ` ${row.unit}` : ''}`
              : '—'
          }
          tooltipMinLength={20}
          lineNumber={2}
        />
      ),
    },
    {
      column: '120px',
      header: <STableHRow justify="center">Confiança</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          {row.confidence ? (
            <Chip
              size="small"
              color={acgihBeiConfidenceColors[row.confidence]}
              label={acgihBeiConfidenceLabels[row.confidence]}
            />
          ) : (
            <STextRow text="—" justify="center" />
          )}
        </Box>
      ),
    },
    {
      column: '120px',
      header: <STableHRow justify="center">Status</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          <Chip
            size="small"
            color={acgihBeiStatusColors[row.status]}
            label={acgihBeiStatusLabels[row.status]}
          />
        </Box>
      ),
    },
    {
      column: '110px',
      header: <STableHRow justify="center">Ações</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5} width="100%">
          <Tooltip title="Editar indicador">
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Remover indicador">
            <IconButton size="small" color="error" onClick={() => onDelete(row)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
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
            contentEmpty="Nenhum indicador ACGIH/BEI encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.id} minHeight={40}>
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
