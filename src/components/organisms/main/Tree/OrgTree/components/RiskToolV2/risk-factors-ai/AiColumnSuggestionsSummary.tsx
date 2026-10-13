import React from 'react';

import AutoAwesomeOutlinedIcon from '@mui/icons-material/AutoAwesomeOutlined';
import { Alert, Box } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import type { ExistingRiskReview } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';

import {
  countPendingSuggestionsByColumn,
  RiskFactorAiColumn,
  RiskFactorAiPendingRiskData,
} from './risk-factor-ai-pending.util';

const COLUMN_LABEL: Record<RiskFactorAiColumn, [string, string]> = {
  source: ['fonte geradora', 'fontes geradoras'],
  eng: ['EPC/ENG', 'EPC/ENG'],
  adm: ['medida administrativa', 'medidas administrativas'],
  rec: ['recomendação', 'recomendações'],
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
  const rows = reviews
    .map((review) => {
      const counts = countPendingSuggestionsByColumn({
        review,
        riskData: riskDataFor(review),
        appliedKeys,
        dismissedKeys,
      });
      const parts = (Object.keys(counts) as RiskFactorAiColumn[])
        .filter((column) => counts[column] > 0)
        .map((column) => {
          const [singular, plural] = COLUMN_LABEL[column];
          return `${counts[column]} ${counts[column] === 1 ? singular : plural}`;
        });
      return { review, parts };
    })
    .filter((row) => row.parts.length > 0);

  if (!rows.length) return null;

  return (
    <Alert severity="info" icon={<AutoAwesomeOutlinedIcon fontSize="small" />}>
      <SText variant="body2" mb={1}>
        Sugestões para riscos já caracterizados estão nas colunas da aba Fatores de
        Riscos, com borda tracejada. Nada foi gravado: confirme, aceite ou descarte
        cada item na própria coluna.
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
