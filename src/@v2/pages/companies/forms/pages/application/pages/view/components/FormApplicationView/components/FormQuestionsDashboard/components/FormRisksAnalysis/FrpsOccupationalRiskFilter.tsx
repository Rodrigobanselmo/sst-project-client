import { Chip, Typography } from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import type { OccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

import {
  FRPS_OCCUPATIONAL_FILTER_LEVELS,
  frpsOccupationalLevelLabel,
} from './frps-occupational-summary.util';

export function FrpsOccupationalRiskFilter({
  selectedLevels,
  onChange,
}: {
  selectedLevels: ReadonlySet<number>;
  onChange: (next: Set<number>) => void;
}) {
  const presentation = useSystemRiskMatrixPresentation();
  const allActive = FRPS_OCCUPATIONAL_FILTER_LEVELS.every((level) =>
    selectedLevels.has(level),
  );

  const toggle = (level: OccupationalRiskLevel) => {
    const next = new Set(selectedLevels);
    if (next.has(level)) next.delete(level);
    else next.add(level);
    onChange(next);
  };

  return (
    <SFlex alignItems="center" gap={1} flexWrap="wrap">
      <Typography variant="body2" color="text.secondary">
        Risco ocupacional
      </Typography>
      {FRPS_OCCUPATIONAL_FILTER_LEVELS.map((level) => {
        const active = selectedLevels.has(level);
        const chip = resolveSystemOccupationalChipColors(level, presentation);
        const label = frpsOccupationalLevelLabel(level);
        return (
          <Chip
            key={level}
            size="small"
            label={label}
            clickable
            aria-pressed={active}
            onClick={() => toggle(level)}
            sx={{
              height: 26,
              fontWeight: 600,
              backgroundColor: active ? chip.bgcolor : 'transparent',
              color: active ? chip.color : 'text.secondary',
              border: '1px solid',
              borderColor: active ? chip.bgcolor : 'grey.400',
              '&:hover': {
                backgroundColor: active ? chip.bgcolor : 'grey.100',
              },
            }}
          />
        );
      })}
      <SButton
        variant="text"
        size="s"
        color="primary"
        text="Todos"
        disabled={allActive}
        onClick={() => onChange(new Set(FRPS_OCCUPATIONAL_FILTER_LEVELS))}
      />
    </SFlex>
  );
}
