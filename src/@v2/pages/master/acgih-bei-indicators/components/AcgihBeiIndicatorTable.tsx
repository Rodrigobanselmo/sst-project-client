import { FC } from 'react';

import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/Edit';
import { Box, Chip, IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import type { IAcgihBeiIndicator } from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';
import { RoutesEnum } from 'core/enums/routes.enums';

import {
  acgihBeiConfidenceColors,
  acgihBeiConfidenceLabels,
  acgihBeiStatusColors,
  acgihBeiStatusLabels,
} from '../acgih-bei-indicator-labels';
import {
  countCriticalPendencies,
  getAcgihBeiPendencies,
} from '../acgih-bei-indicator-pendencies';

/**
 * Coluna Pendências: 0 → chip verde "OK"; 1+ → chip numérico com tooltip
 * listando cada pendência em PT-BR. Cálculo 100% no Client (sem persistência).
 */
const PendenciesCell: FC<{ item: IAcgihBeiIndicator }> = ({ item }) => {
  const pendencies = getAcgihBeiPendencies(item);

  if (!pendencies.length) {
    return (
      <Box display="flex" justifyContent="center" width="100%">
        <Chip size="small" color="success" label="OK" sx={{ fontWeight: 600 }} />
      </Box>
    );
  }

  const critical = countCriticalPendencies(pendencies);
  const tooltip = (
    <Box>
      <Box component="span" sx={{ fontWeight: 600 }}>
        Pendências:
      </Box>
      {pendencies.map((pendency) => (
        <Box key={pendency.code} component="div">
          - {pendency.message}
          {pendency.severity === 'warning' ? ' (recomendado)' : ''}
        </Box>
      ))}
    </Box>
  );

  return (
    <Box display="flex" justifyContent="center" width="100%">
      <Tooltip title={tooltip}>
        <Chip
          size="small"
          color={critical > 0 ? 'warning' : 'default'}
          label={pendencies.length}
          sx={{ fontWeight: 600, cursor: 'default' }}
        />
      </Tooltip>
    </Box>
  );
};

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
  const router = useRouter();

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
      column: '120px',
      header: <STableHRow justify="center">Pendências</STableHRow>,
      row: (row) => <PendenciesCell item={row} />,
    },
    {
      column: '150px',
      header: <STableHRow justify="center">Ações</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5} width="100%">
          <Tooltip title="Ver na análise de elegibilidade (ACGIH/BEI × NR-7 × Regras)">
            <IconButton
              size="small"
              onClick={() =>
                router.push(RoutesEnum.DATABASE_ACGIH_BEI_COMPARISON)
              }
            >
              <CompareArrowsIcon fontSize="small" />
            </IconButton>
          </Tooltip>
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
