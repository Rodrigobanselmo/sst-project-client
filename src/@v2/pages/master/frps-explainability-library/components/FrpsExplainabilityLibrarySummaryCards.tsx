import { Box, Paper, Typography } from '@mui/material';
import type { FrpsLibrarySummary } from '@v2/services/forms/frps-explainability-library';

type CardDef = {
  label: string;
  value: string | number;
};

export function FrpsExplainabilityLibrarySummaryCards({
  summary,
  scopeLabel,
}: {
  summary?: FrpsLibrarySummary;
  scopeLabel?: string;
}) {
  const cards: CardDef[] = [
    {
      label: 'Cobertura',
      value: `${summary?.coveragePercent ?? 0}%`,
    },
    {
      label: 'Validados',
      value: summary?.totalValidated ?? 0,
    },
    {
      label: 'Rascunhos',
      value: summary?.totalDraft ?? 0,
    },
    {
      label: 'Nunca gerados',
      value: summary?.totalNeverGenerated ?? 0,
    },
    {
      label: 'Rejeitados',
      value: summary?.totalRejected ?? 0,
    },
    {
      label: 'Fontes',
      value: `${summary?.validatedSources ?? 0}/${summary?.totalSources ?? 0}`,
    },
    {
      label: 'Recomendações',
      value: `${summary?.validatedRecommendations ?? 0}/${summary?.totalRecommendations ?? 0}`,
    },
  ];

  return (
    <Box mb={2.5}>
      {scopeLabel ? (
        <Typography variant="body2" color="text.secondary" mb={1.25}>
          Recorte: {scopeLabel}
        </Typography>
      ) : null}
      <Box
        display="grid"
        gap={1.25}
        sx={{
          gridTemplateColumns: {
            xs: 'repeat(2, minmax(0, 1fr))',
            sm: 'repeat(3, minmax(0, 1fr))',
            md: 'repeat(4, minmax(0, 1fr))',
            lg: 'repeat(7, minmax(0, 1fr))',
          },
        }}
      >
        {cards.map((card) => (
          <Paper
            key={card.label}
            variant="outlined"
            sx={{ px: 1.5, py: 1.25 }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
              mb={0.25}
            >
              {card.label}
            </Typography>
            <Typography variant="h6" fontSize={18} fontWeight={600}>
              {card.value}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
