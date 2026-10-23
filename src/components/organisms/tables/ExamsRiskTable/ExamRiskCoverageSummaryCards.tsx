import { FC } from 'react';

import { Box, ButtonBase, Paper, Tooltip, Typography } from '@mui/material';
import type {
  ExamRiskCoverageDecisionCounts,
  ExamRiskCoverageFilter,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-decision.util';

type Props = {
  activeFilter: ExamRiskCoverageFilter;
  onFilterChange: (filter: ExamRiskCoverageFilter) => void;
  counts: ExamRiskCoverageDecisionCounts | undefined;
  isLoading?: boolean;
  establishmentScoped?: boolean;
};

const SummaryCard: FC<{
  active: boolean;
  onClick: () => void;
  title: string;
  value: number | string;
  subtitle?: string;
  tooltip?: string;
  accent?: string;
}> = ({ title, value, subtitle, tooltip, accent, active, onClick }) => {
  const card = (
    <Paper
      component={ButtonBase}
      onClick={onClick}
      aria-pressed={active}
      variant="outlined"
      sx={{
        p: 1.5,
        display: 'block',
        textAlign: 'left',
        alignSelf: 'stretch',
        bgcolor: active ? 'action.selected' : 'background.paper',
        borderColor: active ? 'primary.main' : 'divider',
        boxShadow: active ? 2 : 0,
        '&:hover': { bgcolor: 'action.hover' },
        '&.Mui-focusVisible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
        },
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
  activeFilter,
  onFilterChange,
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
          active={activeFilter === 'analyzed'}
          onClick={() => onFilterChange('analyzed')}
          value={isLoading ? '…' : (counts?.analyzed ?? 0)}
          subtitle={scopeHint}
          accent="#1976d2"
        />
        <SummaryCard
          title="Cobertura completa"
          active={activeFilter === 'complete'}
          onClick={() => onFilterChange('complete')}
          value={isLoading ? '…' : (counts?.complete ?? 0)}
          subtitle={scopeHint}
          accent="#2e7d32"
        />
        <SummaryCard
          title="Recomendações disponíveis"
          active={activeFilter === 'recommendationAvailable'}
          onClick={() => onFilterChange('recommendationAvailable')}
          value={isLoading ? '…' : (counts?.recommendationAvailable ?? 0)}
          subtitle="Com recomendação e nenhum exame adotado"
          tooltip="Riscos com recomendação da Biblioteca SimpleSST ainda não adotada pela empresa."
          accent="#d32f2f"
        />
        <SummaryCard
          title="Cobertura incompleta"
          active={activeFilter === 'partiallyAdopted'}
          onClick={() => onFilterChange('partiallyAdopted')}
          value={isLoading ? '…' : (counts?.partiallyAdopted ?? 0)}
          subtitle="Parte adotada, ainda há pendências"
          accent="#ed6c02"
        />
        <SummaryCard
          title="Sem recomendação"
          active={activeFilter === 'noLibraryRecommendation'}
          onClick={() => onFilterChange('noLibraryRecommendation')}
          value={isLoading ? '…' : (counts?.noLibraryRecommendation ?? 0)}
          subtitle={scopeHint}
          accent="#9e9e9e"
        />
        <SummaryCard
          title="Exclusivamente locais"
          active={activeFilter === 'localOnly'}
          onClick={() => onFilterChange('localOnly')}
          value={isLoading ? '…' : (counts?.localOnly ?? 0)}
          subtitle={scopeHint}
          accent="#f57c00"
        />
        <SummaryCard
          title="Sem nenhum exame adotado"
          active={activeFilter === 'recommendedWithoutAdoptedExam'}
          onClick={() => onFilterChange('recommendedWithoutAdoptedExam')}
          value={isLoading ? '…' : (counts?.recommendedWithoutAdoptedExam ?? 0)}
          subtitle="Riscos com recomendação disponível"
          tooltip="Pode coincidir com “Recomendações disponíveis” quando existem recomendações e nenhum exame adotado."
          accent="#c62828"
        />
      </Box>
    </Box>
  );
};
