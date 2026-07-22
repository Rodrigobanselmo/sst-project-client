import { Box, Paper, Typography } from '@mui/material';
import type { FrpsCatalogAdminSummary } from '@v2/services/forms/frps-explainability-library';

type CardDef = {
  label: string;
  value: string | number;
};

export function FrpsExplainabilityLibrarySummaryCards({
  summary,
  scopeLabel,
}: {
  summary?: FrpsCatalogAdminSummary;
  scopeLabel?: string;
}) {
  const cards: CardDef[] = [
    {
      label: 'Itens',
      value: summary?.totalItems ?? 0,
    },
    {
      label: 'Globais',
      value: summary?.totalGlobal ?? 0,
    },
    {
      label: 'Locais',
      value: summary?.totalLocal ?? 0,
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
      label: 'Com equivalência',
      value: summary?.totalWithEquivalence ?? 0,
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
