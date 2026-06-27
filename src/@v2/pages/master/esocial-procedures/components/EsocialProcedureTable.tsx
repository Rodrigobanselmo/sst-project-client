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
import type { IEsocialProcedureItem } from '@v2/services/medicine/esocial-procedure/service/esocial-procedure.types';

import {
  esocialProcedureStatusColors,
  esocialProcedureStatusLabels,
  esocialProcedureTypeLabels,
} from '../esocial-procedure-labels';

type Props = {
  data: IEsocialProcedureItem[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onEdit: (item: IEsocialProcedureItem) => void;
  onDelete: (item: IEsocialProcedureItem) => void;
};

export const EsocialProcedureTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onEdit,
  onDelete,
}) => {
  const tableData: ITableData<IEsocialProcedureItem>[] = [
    {
      column: '120px',
      header: <STableHRow>Código</STableHRow>,
      row: (row) => <STextRow text={row.procedureCode} lineNumber={1} />,
    },
    {
      column: 'minmax(280px, 1fr)',
      header: <STableHRow>Procedimento (Tabela 27)</STableHRow>,
      row: (row) => (
        <Box display="flex" alignItems="center" gap={0.5}>
          <STextRow
            text={row.officialName ?? '—'}
            tooltipMinLength={40}
            lineNumber={2}
          />
          {row.isOrphanCuration && (
            <Tooltip title="Curadoria de um código que não está mais no catálogo oficial da Tabela 27">
              <Chip size="small" color="warning" label="Fora do catálogo" />
            </Tooltip>
          )}
        </Box>
      ),
    },
    {
      column: '150px',
      header: <STableHRow justify="center">Relevância</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          {row.curation?.isOccupationalRelevant ? (
            <Chip size="small" color="info" label="Ocupacional" />
          ) : (
            <STextRow text="—" justify="center" />
          )}
        </Box>
      ),
    },
    {
      column: '150px',
      header: <STableHRow>Tipo técnico</STableHRow>,
      row: (row) => (
        <STextRow
          text={
            row.curation?.technicalType
              ? esocialProcedureTypeLabels[row.curation.technicalType]
              : '—'
          }
          lineNumber={1}
        />
      ),
    },
    {
      column: '140px',
      header: <STableHRow justify="center">Status</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" width="100%">
          {row.curation ? (
            <Chip
              size="small"
              color={esocialProcedureStatusColors[row.curation.status]}
              label={esocialProcedureStatusLabels[row.curation.status]}
            />
          ) : (
            <Chip size="small" variant="outlined" label="Não curado" />
          )}
        </Box>
      ),
    },
    {
      column: '110px',
      header: <STableHRow justify="center">Ações</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5} width="100%">
          <Tooltip title={row.curation ? 'Editar curadoria' : 'Curar procedimento'}>
            <IconButton size="small" onClick={() => onEdit(row)}>
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.curation
                ? 'Remover curadoria'
                : 'Nada para remover (sem curadoria)'
            }
          >
            <span>
              <IconButton
                size="small"
                color="error"
                disabled={!row.curation}
                onClick={() => onDelete(row)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </span>
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
            contentEmpty="Nenhum procedimento encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.procedureCode} minHeight={40}>
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
