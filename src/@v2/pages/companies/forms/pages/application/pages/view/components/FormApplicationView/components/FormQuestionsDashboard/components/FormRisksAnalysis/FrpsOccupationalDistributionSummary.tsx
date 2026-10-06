import { Box, Tooltip, Typography } from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';

import type { FrpsOccupationalDistribution } from './frps-occupational-distribution.util';

function formatShare(percentage: number | null): string {
  if (percentage == null) return '—';
  return `${percentage.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
  })}%`;
}

export function FrpsOccupationalDistributionSummary({
  distribution,
}: {
  distribution: FrpsOccupationalDistribution;
}) {
  const presentation = useSystemRiskMatrixPresentation();
  const barLevels = distribution.levels.filter((level) => level.count > 0);

  return (
    <SFlex direction="column" gap={0.75} mt="12px" mb="16px">
      <Box
        role="img"
        aria-label={
          distribution.classified === 0
            ? 'Nenhum diagnóstico classificado'
            : barLevels
                .map(
                  (level) =>
                    `${level.label}: ${level.count} (${formatShare(level.percentage)})`,
                )
                .join(', ')
        }
        sx={{
          display: 'flex',
          height: 12,
          borderRadius: 999,
          overflow: 'hidden',
          bgcolor: 'grey.200',
        }}
      >
        {barLevels.map((level) => {
          const chip = resolveSystemOccupationalChipColors(
            level.level,
            presentation,
          );
          return (
            <Tooltip
              key={level.level}
              title={`${level.label}: ${level.count} (${formatShare(level.percentage)})`}
            >
              <Box
                sx={{
                  flexGrow: level.count,
                  flexBasis: 0,
                  minWidth: 0,
                  bgcolor: chip.bgcolor,
                }}
              />
            </Tooltip>
          );
        })}
      </Box>

      <SFlex alignItems="center" gap={1.5} flexWrap="wrap">
        {distribution.levels.map((level) => {
          const chip = resolveSystemOccupationalChipColors(
            level.level,
            presentation,
          );
          return (
            <SFlex key={level.level} alignItems="center" gap={0.5}>
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: chip.bgcolor,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption" color="text.secondary">
                {level.label} {level.count} · {formatShare(level.percentage)}
              </Typography>
            </SFlex>
          );
        })}
      </SFlex>

      <Typography variant="caption" color="text.secondary">
        Total {distribution.total} · Classificados {distribution.classified} · Não
        informados {distribution.unclassified}
      </Typography>
    </SFlex>
  );
}
