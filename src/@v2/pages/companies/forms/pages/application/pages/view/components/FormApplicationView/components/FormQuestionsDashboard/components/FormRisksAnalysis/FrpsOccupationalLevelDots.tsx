import { Box } from '@mui/material';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import type { OccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

import { frpsOccupationalLevelLabel } from './frps-occupational-summary.util';

export function FrpsOccupationalLevelDots({
  levels,
}: {
  levels: readonly OccupationalRiskLevel[];
}) {
  const presentation = useSystemRiskMatrixPresentation();
  if (levels.length === 0) return null;

  const summary = levels.map((level) => frpsOccupationalLevelLabel(level)).join(', ');

  return (
    <Box
      aria-label={`Riscos ocupacionais neste FRPS: ${summary}`}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        pointerEvents: 'none',
      }}
    >
      {levels.map((level) => {
        const chip = resolveSystemOccupationalChipColors(level, presentation);
        return (
          <Box
            key={level}
            component="span"
            sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: chip.bgcolor,
              boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.85)',
            }}
          />
        );
      })}
    </Box>
  );
}
