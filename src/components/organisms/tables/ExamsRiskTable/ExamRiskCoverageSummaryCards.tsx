import { FC } from 'react';

import { Box, Paper, Tooltip, Typography } from '@mui/material';
import type { ExamRiskCoverageDecisionCounts } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-decision.util';

type Props = {
  counts: ExamRiskCoverageDecisionCounts | undefined;
  isLoading?: boolean;
  establishmentScoped?: boolean;
};

const SummaryCard: FC<{
  title: string;
  value: number | string;
  subtitle?: string;
  tooltip?: string;
  accent?: string;
}> = ({ title, value, subtitle, tooltip, accent }) => {
  const card = (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        flex: '1 1 140px',
        minWidth: 130,
        borderTopWidth: 3,
        borderTopStyle: 'solid',
        borderTopColor: accent ?? 'divider',
      }}
    >
      <Typography variant="caption" color="text.secondary" display="block">
        {title}
      </Typography>
      <Typography variant="h6" fontWeight={600} mt={0.25}>
        {value}
      </Typography>
      {subtitle && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          mt={0.25}
        >
          {subtitle}
        </Typography>
      )}
    </Paper>
  );

  return tooltip ? <Tooltip title={tooltip}>{card}</Tooltip> : card;
};

export const ExamRiskCoverageSummaryCards: FC<Props> = ({
  counts,
  isLoading,
  establishmentScoped = true,
}) => {
  const scopeHint = establishmentScoped ? 'deste estabelecimento' : undefined;

  return (
    <Box display="flex" flexDirection="column" gap={0.75} mt={1} mb={1}>
      <Typography variant="caption" color="text.secondary">
        Indicadores de cobertura
        {establishmentScoped
          ? ' — apenas o estabelecimento selecionado (não a empresa inteira)'
          : ''}
      </Typography>
      <Box display="flex" gap={1.5} flexWrap="wrap">
        <SummaryCard
          title="Riscos analisados"
          value={isLoading ? '…' : (counts?.analyzed ?? 0)}
          subtitle={scopeHint}
          accent="#1976d2"
        />
        <SummaryCard
          title="Cobertura completa"
          value={isLoading ? '…' : (counts?.complete ?? 0)}
          subtitle={scopeHint}
          accent="#2e7d32"
        />
        <SummaryCard
          title="Recomendações disponíveis"
          value={isLoading ? '…' : (counts?.recommendationAvailable ?? 0)}
          subtitle="Com padrão ACTIVE e nenhum exame adotado"
          tooltip="Riscos com recomendação da Biblioteca SimpleSST ainda não adotada pela empresa."
          accent="#d32f2f"
        />
        <SummaryCard
          title="Cobertura incompleta"
          value={isLoading ? '…' : (counts?.partiallyAdopted ?? 0)}
          subtitle="Parte adotada, ainda há pendências"
          accent="#ed6c02"
        />
        <SummaryCard
          title="Sem recomendação"
          value={isLoading ? '…' : (counts?.noLibraryRecommendation ?? 0)}
          subtitle={scopeHint}
          accent="#9e9e9e"
        />
        <SummaryCard
          title="Exclusivamente locais"
          value={isLoading ? '…' : (counts?.localOnly ?? 0)}
          subtitle={scopeHint}
          accent="#f57c00"
        />
        <SummaryCard
          title="Sem nenhum exame adotado"
          value={isLoading ? '…' : (counts?.recommendedWithoutAdoptedExam ?? 0)}
          subtitle="Subset com recomendação ativa"
          tooltip="Coincide com “Recomendações disponíveis” quando há regra ACTIVE e zero vínculos."
          accent="#c62828"
        />
      </Box>
    </Box>
  );
};
