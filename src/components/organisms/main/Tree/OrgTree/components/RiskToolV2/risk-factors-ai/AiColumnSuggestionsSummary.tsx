import React, { useMemo } from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Alert, Box, Chip } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import type { ExistingRiskReview } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import {
  countPendingSuggestionsByColumn,
  RiskFactorAiColumn,
  RiskFactorAiPendingRiskData,
} from './risk-factor-ai-pending.util';

const COLUMN_ORDER: RiskFactorAiColumn[] = [
  'source',
  'eng',
  'adm',
  'rec',
  'probability',
];

const COLUMN_LABEL: Record<RiskFactorAiColumn, [string, string]> = {
  source: ['fonte geradora', 'fontes geradoras'],
  eng: ['EPC/ENG', 'EPC/ENG'],
  adm: ['medida administrativa', 'medidas administrativas'],
  rec: ['recomendação', 'recomendações'],
  probability: ['probabilidade sugerida', 'probabilidades sugeridas'],
};

/** Rótulo curto do chip no resumo (espaço já existente do Alert). */
const COLUMN_CHIP_LABEL: Record<RiskFactorAiColumn, string> = {
  source: 'Fonte',
  eng: 'EPC/ENG',
  adm: 'ADM',
  rec: 'Rec',
  probability: 'Prob.',
};

export function AiColumnSuggestionsSummary({
  reviews,
  riskDataFor,
  appliedKeys,
  dismissedKeys,
}: {
  reviews: ExistingRiskReview[];
  riskDataFor: (review: ExistingRiskReview) => RiskFactorAiPendingRiskData | undefined;
  appliedKeys: Set<string>;
  dismissedKeys: Set<string>;
}) {
  const { rows, totals } = useMemo(() => {
    const emptyTotals = {
      source: 0,
      eng: 0,
      adm: 0,
      rec: 0,
      probability: 0,
    } as Record<RiskFactorAiColumn, number>;

    const nextRows = reviews
      .map((review) => {
        const counts = countPendingSuggestionsByColumn({
          review,
          riskData: riskDataFor(review),
          appliedKeys,
          dismissedKeys,
        });
        const parts = COLUMN_ORDER.filter((column) => counts[column] > 0).map(
          (column) => {
            const [singular, plural] = COLUMN_LABEL[column];
            return `${counts[column]} ${
              counts[column] === 1 ? singular : plural
            }`;
          },
        );
        return { review, parts, counts };
      })
      .filter((row) => row.parts.length > 0);

    const nextTotals = nextRows.reduce((acc, row) => {
      for (const column of COLUMN_ORDER) {
        acc[column] += row.counts[column];
      }
      return acc;
    }, emptyTotals);

    return { rows: nextRows, totals: nextTotals };
  }, [appliedKeys, dismissedKeys, reviews, riskDataFor]);

  if (!rows.length) return null;

  const totalPending = COLUMN_ORDER.reduce(
    (sum, column) => sum + totals[column],
    0,
  );

  return (
    <Alert
      severity="info"
      icon={<AutoAwesomeOutlinedIcon fontSize="small" />}
      data-testid="ai-column-suggestions-summary"
    >
      <SText variant="body2" mb={1}>
        {totalPending === 1
          ? '1 sugestão pendente nas colunas da aba Fatores de Riscos (borda tracejada).'
          : `${totalPending} sugestões pendentes nas colunas da aba Fatores de Riscos (borda tracejada).`}{' '}
        Nada foi gravado.
      </SText>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 0.5,
          mb: 1,
        }}
        data-testid="ai-column-suggestions-summary-badges"
      >
        {COLUMN_ORDER.filter((column) => totals[column] > 0).map((column) => (
          <Chip
            key={column}
            size="small"
            variant="outlined"
            color="info"
            label={`${COLUMN_CHIP_LABEL[column]} · ${totals[column]}`}
            sx={{ height: 22, '& .MuiChip-label': { px: 0.75, fontSize: 11 } }}
          />
        ))}
      </Box>
      <SText variant="body2" color="text.secondary" mb={1} fontSize={12}>
        {
          'Ações na coluna: Confirmar que existe (controles existentes) · Aceitar recomendação (medidas propostas) · Aprovar Pn (probabilidade sugerida).'
        }
      </SText>
      <Box component="ul" sx={{ m: 0, pl: 2 }}>
        {rows.map(({ review, parts }) => (
          <li key={review.riskId}>
            <SText variant="body2">
              <strong>{review.name || 'Risco'}:</strong> {parts.join(', ')}
            </SText>
          </li>
        ))}
      </Box>
    </Alert>
  );
}
