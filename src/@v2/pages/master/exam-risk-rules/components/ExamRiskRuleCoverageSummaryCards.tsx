import { FC } from 'react';

import { Box, Paper, Typography } from '@mui/material';
import type { IExamRiskRuleCoverageGapsSummary } from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule-coverage-gaps.types';

import { examRiskRuleCategoryLabels } from '../exam-risk-rule-labels';

type Props = {
  summary: IExamRiskRuleCoverageGapsSummary | undefined;
  isLoading?: boolean;
};

const SummaryCard: FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  accent?: string;
}> = ({ title, value, subtitle, accent }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      flex: '1 1 160px',
      minWidth: 150,
      borderTopWidth: 3,
      borderTopStyle: 'solid',
      borderTopColor: accent ?? 'divider',
    }}
  >
    <Typography variant="caption" color="text.secondary" display="block">
      {title}
    </Typography>
    <Typography variant="h5" fontWeight={600} mt={0.5}>
      {value}
    </Typography>
    {subtitle && (
      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
        {subtitle}
      </Typography>
    )}
  </Paper>
);

export const ExamRiskRuleCoverageSummaryCards: FC<Props> = ({
  summary,
  isLoading,
}) => {
  const byType = summary?.byType;
  const typeBreakdown = byType
    ? Object.entries(byType)
        .filter(([, count]) => count > 0)
        .map(
          ([type, count]) =>
            `${examRiskRuleCategoryLabels[type as keyof typeof examRiskRuleCategoryLabels] ?? type}: ${count}`,
        )
        .join(' · ')
    : '—';

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <Box display="flex" gap={2} flexWrap="wrap">
        <SummaryCard
          title="Total de riscos"
          value={isLoading ? '…' : (summary?.totalRisks ?? 0)}
          accent="#1976d2"
        />
        <SummaryCard
          title="Cobertos por regra"
          value={isLoading ? '…' : (summary?.coveredByRule ?? 0)}
          accent="#2e7d32"
        />
        <SummaryCard
          title="Sem cobertura"
          value={isLoading ? '…' : (summary?.uncovered ?? 0)}
          accent="#d32f2f"
        />
        <SummaryCard
          title="Cobertura indireta"
          value={isLoading ? '…' : (summary?.indirectBiologicalCoverageOnly ?? 0)}
          subtitle="Indicador biológico + exame confirmado, sem regra"
          accent="#ed6c02"
        />
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary" display="block">
          Breakdown por tipo
        </Typography>
        <Typography variant="body2" mt={0.5}>
          {isLoading ? 'Carregando…' : typeBreakdown || '—'}
        </Typography>
      </Paper>
    </Box>
  );
};
