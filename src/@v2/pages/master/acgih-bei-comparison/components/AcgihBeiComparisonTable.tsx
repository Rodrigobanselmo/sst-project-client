import { FC } from 'react';

import AddLinkIcon from '@mui/icons-material/AddLink';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Box, Button, Chip, Tooltip } from '@mui/material';
import { STextRow } from '@v2/components/organisms/STable/addons/addons-rows/STextRow/STextRow';
import { STablePagination } from '@v2/components/organisms/STable/addons/addons-table/STablePagination/STablePagination';
import { STable } from '@v2/components/organisms/STable/common/STable/STable';
import { ITableData } from '@v2/components/organisms/STable/common/STable/STable.types';
import { STableBody } from '@v2/components/organisms/STable/common/STableBody/STableBody';
import { STableHeader } from '@v2/components/organisms/STable/common/STableHeader/STableHeader';
import { STableHRow } from '@v2/components/organisms/STable/common/STableHRow/STableHRow';
import { STableRow } from '@v2/components/organisms/STable/common/STableRow/STableRow';
import {
  acgihBeiConfidenceColors,
  acgihBeiConfidenceLabels,
} from '@v2/pages/master/acgih-bei-indicators/acgih-bei-indicator-labels';
import {
  AcgihBeiComparisonStatusEnum,
  AcgihBeiSuggestedActionEnum,
  IAcgihBeiComparisonRow,
} from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';

import {
  comparisonStatusColors,
  comparisonStatusLabels,
  matchStatusColors,
  matchStatusLabels,
  suggestedActionLabels,
} from '../acgih-bei-comparison-labels';

type Props = {
  data: IAcgihBeiComparisonRow[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onAddReference: (row: IAcgihBeiComparisonRow) => void;
  applyingId?: string | null;
};

/** Item elegível para virar fonte complementar (espelha as regras da API). */
export const isEligibleForReference = (row: IAcgihBeiComparisonRow): boolean =>
  row.comparisonStatus === AcgihBeiComparisonStatusEnum.ALREADY_COVERED &&
  row.suggestedAction === AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY &&
  Boolean(row.examRiskRuleId);

export const AcgihBeiComparisonTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onAddReference,
  applyingId,
}) => {
  const tableData: ITableData<IAcgihBeiComparisonRow>[] = [
    {
      column: 'minmax(200px, 1.2fr)',
      header: <STableHRow>ACGIH/BEI</STableHRow>,
      row: (row) => (
        <Box display="flex" flexDirection="column">
          <STextRow text={row.substanceName} lineNumber={2} />
          <STextRow
            text={[row.cas ? `CAS ${row.cas}` : null, row.determinant]
              .filter(Boolean)
              .join(' · ')}
            fontSize={11}
            color="text.secondary"
            lineNumber={2}
          />
          <STextRow
            text={[
              row.biologicalMatrix,
              row.samplingTime,
              row.beiValue
                ? `${row.beiValue}${row.unit ? ` ${row.unit}` : ''}`
                : null,
            ]
              .filter(Boolean)
              .join(' · ')}
            fontSize={11}
            color="text.secondary"
            lineNumber={2}
          />
        </Box>
      ),
    },
    {
      column: '110px',
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
      column: 'minmax(160px, 1fr)',
      header: <STableHRow>Match NR-7</STableHRow>,
      row: (row) => (
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Chip
            size="small"
            variant="outlined"
            color={matchStatusColors[row.nr7MatchStatus]}
            label={matchStatusLabels[row.nr7MatchStatus]}
          />
          {row.nr7IndicatorName && (
            <STextRow
              text={row.nr7IndicatorName}
              fontSize={11}
              color="text.secondary"
              lineNumber={2}
            />
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(160px, 1fr)',
      header: <STableHRow>Match Biblioteca Risco × Exame</STableHRow>,
      row: (row) => (
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Chip
            size="small"
            variant="outlined"
            color={matchStatusColors[row.examRiskRuleMatchStatus]}
            label={matchStatusLabels[row.examRiskRuleMatchStatus]}
          />
          {row.examNameSnapshot && (
            <STextRow
              text={row.examNameSnapshot}
              fontSize={11}
              color="text.secondary"
              lineNumber={2}
            />
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(220px, 1.4fr)',
      header: <STableHRow>Classificação / Diferenças</STableHRow>,
      row: (row) => (
        <Box display="flex" flexDirection="column" gap={0.5}>
          <Box display="flex" gap={0.5} flexWrap="wrap">
            <Chip
              size="small"
              color={comparisonStatusColors[row.comparisonStatus]}
              label={comparisonStatusLabels[row.comparisonStatus]}
            />
          </Box>
          {row.technicalDiff && (
            <Tooltip title={row.technicalDiff}>
              <span>
                <STextRow
                  text={row.technicalDiff}
                  fontSize={11}
                  color="text.secondary"
                  lineNumber={2}
                />
              </span>
            </Tooltip>
          )}
          {row.reviewNotes && (
            <STextRow
              text={row.reviewNotes}
              fontSize={11}
              color="text.secondary"
              lineNumber={2}
            />
          )}
        </Box>
      ),
    },
    {
      column: 'minmax(170px, 1fr)',
      header: <STableHRow>Ação sugerida</STableHRow>,
      row: (row) => (
        <STextRow
          text={suggestedActionLabels[row.suggestedAction]}
          lineNumber={2}
        />
      ),
    },
    {
      column: '210px',
      header: <STableHRow justify="center">Fonte complementar</STableHRow>,
      row: (row) => {
        // Vínculo já registrado tem precedência visual sobre o botão.
        if (row.hasComplementaryReference) {
          return (
            <Box display="flex" justifyContent="center" width="100%">
              <Tooltip title="Esta ACGIH/BEI já está registrada como fonte complementar da regra.">
                <Chip
                  size="small"
                  color="success"
                  variant="outlined"
                  icon={<CheckCircleOutlineIcon />}
                  label="ACGIH/BEI registrada"
                />
              </Tooltip>
            </Box>
          );
        }

        const eligible = isEligibleForReference(row);
        const disabledReason = !eligible
          ? 'Disponível apenas para itens já cobertos com sugestão de fonte complementar e regra existente.'
          : '';
        const isApplying = applyingId === row.acgihBeiId;
        return (
          <Box display="flex" justifyContent="center" width="100%">
            <Tooltip title={disabledReason}>
              <span>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddLinkIcon />}
                  disabled={!eligible || isApplying}
                  onClick={() => onAddReference(row)}
                >
                  Adicionar
                </Button>
              </span>
            </Tooltip>
          </Box>
        );
      },
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
            contentEmpty="Nenhum item de comparação encontrado com os filtros atuais."
            renderRow={(row) => (
              <STableRow key={row.acgihBeiId} minHeight={40}>
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
