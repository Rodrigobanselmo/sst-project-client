import { FC } from 'react';

import AddLinkIcon from '@mui/icons-material/AddLink';
import BiotechIcon from '@mui/icons-material/Biotech';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ScienceIcon from '@mui/icons-material/Science';
import { Box, Button, Chip, IconButton, Tooltip } from '@mui/material';
import { useRouter } from 'next/router';
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
import { RoutesEnum } from 'core/enums/routes.enums';

import {
  comparisonDecisionColors,
  comparisonDecisionExplanations,
  comparisonDecisionLabels,
  comparisonNextStep,
  comparisonStatusColors,
  comparisonStatusExplanations,
  comparisonStatusLabels,
  matchStatusColors,
  matchStatusLabels,
  ruleMatchMethodLabels,
  ruleMatchMethodTooltips,
  suggestedActionExplanations,
  suggestedActionLabels,
} from '../acgih-bei-comparison-labels';
import {
  getComparisonReadiness,
  parseTechnicalDiff,
} from '../acgih-bei-comparison-readiness';

type Props = {
  data: IAcgihBeiComparisonRow[];
  isLoading?: boolean;
  pagination: { total: number; limit: number; page: number };
  setPage: (page: number) => void;
  pageSizeOptions: number[];
  onPageSizeChange: (size: number) => void;
  onAddReference: (row: IAcgihBeiComparisonRow) => void;
  applyingId?: string | null;
  onRegisterDecision: (row: IAcgihBeiComparisonRow) => void;
  onClearDecision: (row: IAcgihBeiComparisonRow) => void;
  clearingId?: string | null;
};

/** Item elegível para virar fonte complementar (espelha as regras da API). */
export const isEligibleForReference = (row: IAcgihBeiComparisonRow): boolean =>
  row.comparisonStatus === AcgihBeiComparisonStatusEnum.ALREADY_COVERED &&
  row.suggestedAction === AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY &&
  Boolean(row.examRiskRuleId);

/** Coluna de readiness: chips de contexto das três bases (4L.1b). */
const ReadinessCell: FC<{ row: IAcgihBeiComparisonRow }> = ({ row }) => {
  const chips = getComparisonReadiness(row);
  if (!chips.length) {
    return <STextRow text="—" color="text.secondary" />;
  }
  return (
    <Box display="flex" flexDirection="column" gap={0.5}>
      {chips.map((chip) => (
        <Tooltip key={chip.key} title={chip.tooltip ?? ''}>
          <Chip
            size="small"
            variant="outlined"
            color={chip.color}
            label={chip.label}
            sx={{ cursor: 'default', justifyContent: 'flex-start' }}
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export const AcgihBeiComparisonTable: FC<Props> = ({
  data,
  isLoading,
  pagination,
  setPage,
  pageSizeOptions,
  onPageSizeChange,
  onAddReference,
  applyingId,
  onRegisterDecision,
  onClearDecision,
  clearingId,
}) => {
  const router = useRouter();

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
      row: (row) => {
        const method =
          row.ruleMatchMethod === 'VIA_NR7' ||
          row.ruleMatchMethod === 'VIA_AGENT'
            ? row.ruleMatchMethod
            : null;
        return (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" gap={0.5} flexWrap="wrap" alignItems="center">
              <Chip
                size="small"
                variant="outlined"
                color={matchStatusColors[row.examRiskRuleMatchStatus]}
                label={matchStatusLabels[row.examRiskRuleMatchStatus]}
              />
              {method && (
                <Tooltip title={ruleMatchMethodTooltips[method]}>
                  <Chip
                    size="small"
                    variant="outlined"
                    color={method === 'VIA_NR7' ? 'info' : 'default'}
                    label={ruleMatchMethodLabels[method]}
                    sx={{ cursor: 'default' }}
                  />
                </Tooltip>
              )}
            </Box>
            {row.examNameSnapshot && (
              <STextRow
                text={row.examNameSnapshot}
                fontSize={11}
                color="text.secondary"
                lineNumber={2}
              />
            )}
          </Box>
        );
      },
    },
    {
      column: 'minmax(240px, 1.5fr)',
      header: <STableHRow>Classificação / Diferenças</STableHRow>,
      row: (row) => {
        const diffParts = parseTechnicalDiff(row.technicalDiff);
        return (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              <Tooltip title={comparisonStatusExplanations[row.comparisonStatus]}>
                <Chip
                  size="small"
                  color={comparisonStatusColors[row.comparisonStatus]}
                  label={comparisonStatusLabels[row.comparisonStatus]}
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
            </Box>
            {diffParts.length > 0 && (
              <Box display="flex" flexDirection="column" gap={0.25}>
                {diffParts.map((part) => (
                  <Tooltip key={part.key} title={part.detail}>
                    <Box display="flex" gap={0.5} alignItems="baseline">
                      <Box
                        component="span"
                        sx={{ fontSize: 11, fontWeight: 600, color: 'text.secondary' }}
                      >
                        {part.label}:
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          fontSize: 11,
                          color: 'text.secondary',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: 200,
                        }}
                      >
                        {part.detail}
                      </Box>
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            )}
            {row.reviewNotes && (
              <STextRow
                text={row.reviewNotes}
                fontSize={11}
                color="text.secondary"
                lineNumber={2}
              />
            )}
            <STextRow
              text={comparisonNextStep[row.comparisonStatus]}
              fontSize={11}
              color="primary.main"
              lineNumber={2}
            />
          </Box>
        );
      },
    },
    {
      column: 'minmax(170px, 1fr)',
      header: <STableHRow>Ação sugerida</STableHRow>,
      row: (row) => (
        <Tooltip title={suggestedActionExplanations[row.suggestedAction]}>
          <span>
            <STextRow
              text={suggestedActionLabels[row.suggestedAction]}
              lineNumber={2}
            />
          </span>
        </Tooltip>
      ),
    },
    {
      column: 'minmax(170px, 1fr)',
      header: <STableHRow>Contexto / Readiness</STableHRow>,
      row: (row) => <ReadinessCell row={row} />,
    },
    {
      column: 'minmax(200px, 1.2fr)',
      header: <STableHRow>Decisão técnica</STableHRow>,
      row: (row) => {
        if (!row.review) {
          return (
            <Box display="flex" width="100%">
              <Button
                size="small"
                variant="outlined"
                onClick={() => onRegisterDecision(row)}
              >
                Registrar decisão
              </Button>
            </Box>
          );
        }
        const isClearing = clearingId === row.acgihBeiId;
        return (
          <Box display="flex" flexDirection="column" gap={0.5}>
            <Box display="flex" gap={0.5} flexWrap="wrap" alignItems="center">
              <Tooltip
                title={comparisonDecisionExplanations[row.review.decision]}
              >
                <Chip
                  size="small"
                  color={comparisonDecisionColors[row.review.decision]}
                  label={comparisonDecisionLabels[row.review.decision]}
                  sx={{ cursor: 'default' }}
                />
              </Tooltip>
              {row.review.isStale && (
                <Tooltip title="A classificação foi recalculada e difere do momento da decisão. Revisar.">
                  <Chip
                    size="small"
                    variant="outlined"
                    color="warning"
                    label="recalculada"
                    sx={{ cursor: 'default' }}
                  />
                </Tooltip>
              )}
            </Box>
            <Tooltip title={row.review.technicalNote}>
              <span>
                <STextRow
                  text={row.review.technicalNote}
                  fontSize={11}
                  color="text.secondary"
                  lineNumber={2}
                />
              </span>
            </Tooltip>
            <STextRow
              text={[
                row.review.reviewedByName
                  ? `por ${row.review.reviewedByName}`
                  : null,
                row.review.reviewedAt
                  ? new Date(row.review.reviewedAt).toLocaleString('pt-BR')
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
              fontSize={10}
              color="text.secondary"
            />
            <Box display="flex" gap={0.5}>
              <Button
                size="small"
                variant="text"
                onClick={() => onRegisterDecision(row)}
              >
                Editar
              </Button>
              <Button
                size="small"
                variant="text"
                color="error"
                disabled={isClearing}
                onClick={() => onClearDecision(row)}
              >
                Limpar
              </Button>
            </Box>
          </Box>
        );
      },
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
    {
      column: '130px',
      header: <STableHRow justify="center">Abrir</STableHRow>,
      row: (row) => (
        <Box display="flex" justifyContent="center" gap={0.5} width="100%">
          <Tooltip
            title={
              row.nr7IndicatorId
                ? 'Abrir indicador NR-7 de origem'
                : 'Sem indicador NR-7 relacionado'
            }
          >
            <span>
              <IconButton
                size="small"
                disabled={!row.nr7IndicatorId}
                onClick={() =>
                  router.push(
                    `${RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS}/${row.nr7IndicatorId}`,
                  )
                }
              >
                <BiotechIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Abrir base ACGIH/BEI">
            <IconButton
              size="small"
              onClick={() =>
                router.push(RoutesEnum.DATABASE_ACGIH_BEI_INDICATORS)
              }
            >
              <ScienceIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip
            title={
              row.examRiskRuleId
                ? 'Abrir Biblioteca Risco × Exame'
                : 'Sem regra relacionada na Biblioteca'
            }
          >
            <span>
              <IconButton
                size="small"
                disabled={!row.examRiskRuleId}
                onClick={() => router.push(RoutesEnum.DATABASE_EXAM_RISK_RULES)}
              >
                <MenuBookIcon fontSize="small" />
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
