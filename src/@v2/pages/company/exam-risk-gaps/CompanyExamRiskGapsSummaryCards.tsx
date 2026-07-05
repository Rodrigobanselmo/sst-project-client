import { FC } from 'react';

import { Box, Paper, Typography } from '@mui/material';
import type { ICompanyExamRiskGapsSummary } from '@v2/services/medicine/company-exam-risk-gaps/company-exam-risk-gaps.types';

type Props = {
  summary: ICompanyExamRiskGapsSummary | undefined;
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

export const CompanyExamRiskGapsSummaryCards: FC<Props> = ({
  summary,
  isLoading,
}) => (
  <Box display="flex" gap={2} flexWrap="wrap">
    <SummaryCard
      title="Riscos analisados"
      value={isLoading ? '…' : (summary?.totalRisks ?? 0)}
      accent="#1976d2"
    />
    <SummaryCard
      title="Lacunas"
      value={isLoading ? '…' : (summary?.missingLinks ?? 0)}
      subtitle={`${summary?.risksWithMissingLinks ?? 0} risco(s) com lacuna`}
      accent="#d32f2f"
    />
    <SummaryCard
      title="Já vinculados"
      value={isLoading ? '…' : (summary?.alreadyLinked ?? 0)}
      accent="#2e7d32"
    />
    <SummaryCard
      title="Divergências de config"
      value={isLoading ? '…' : (summary?.configDrifts ?? 0)}
      subtitle="Somente informativo"
      accent="#0288d1"
    />
    <SummaryCard
      title="Sem referência global"
      value={isLoading ? '…' : (summary?.risksWithoutGlobalReference ?? 0)}
      accent="#ed6c02"
    />
  </Box>
);
