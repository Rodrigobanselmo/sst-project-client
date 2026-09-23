import { Chip, Stack, Typography } from '@mui/material';

import { RiskPrioritizationLegendEntry } from '@v2/services/security/risk-prioritization/risk-prioritization.types';

import { contrastTextColor, normalizeCssColor } from './risk-prioritization.util';

export function RiskPrioritizationLegend({
  entries,
}: {
  entries: RiskPrioritizationLegendEntry[];
}) {
  if (!entries.length) return null;

  const abbreviations = entries.map((entry) => entry.abbreviation);
  const hasCollision = abbreviations.some(
    (short, index) => abbreviations.indexOf(short) !== index,
  );

  return (
    <Stack spacing={1} sx={{ mt: 2 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={700}>
        Legenda
      </Typography>
      <Stack direction="row" flexWrap="wrap" gap={1}>
        {entries.map((entry) => (
          <Chip
            key={`${entry.matrixSource}:${entry.abbreviation}:${entry.label}`}
            size="small"
            label={
              hasCollision
                ? `${entry.abbreviation} = ${entry.label} (${entry.matrixSource === 'CUSTOM' ? 'Personalizada' : 'Sistema'})`
                : `${entry.abbreviation} = ${entry.label}`
            }
            sx={{
              bgcolor: normalizeCssColor(entry.color) || 'grey.200',
              color: contrastTextColor(entry.color),
              fontWeight: 600,
              maxWidth: '100%',
              '& .MuiChip-label': { whiteSpace: 'normal' },
            }}
          />
        ))}
      </Stack>
    </Stack>
  );
}
