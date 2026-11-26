import type { ReactNode } from 'react';
import { Button, Chip, Typography } from '@mui/material';

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
  actions,
}: {
  actions?: ReactNode;
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
    <SFlex direction="column" gap={4} mt={8} mb={10}>
            <Typography variant="body2" color="text.primary" fontWeight={600}>
        Legenda e filtro por risco ocupacional
      </Typography>
      <SFlex alignItems="center" justifyContent="space-between" gap={6} flexWrap="wrap">
      <SFlex alignItems="center" gap={3} flexWrap="wrap">
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
              height: 28,
              width: 112,
              flexShrink: 0,
              fontWeight: 600,
              backgroundColor: active ? chip.bgcolor : 'transparent',
              color: active ? (level === 5 ? '#FFFFFF' : '#000000') : 'text.secondary',
              border: '1px solid',
              borderColor: active ? chip.bgcolor : 'grey.400',
              '&:hover': {
                backgroundColor: active ? chip.bgcolor : 'action.hover',
              },
            }}
          />
        );
      })}
      <Button
        variant="outlined"
        size="small"
        aria-pressed={allActive}
        onClick={() => onChange(new Set(FRPS_OCCUPATIONAL_FILTER_LEVELS))}
        sx={{
          width: 112,
          minWidth: 112,
          height: 28,
          p: 0,
          fontSize: 13,
          fontWeight: 600,
          color: allActive ? 'text.primary' : 'text.secondary',
          backgroundColor: 'transparent',
          borderColor: allActive ? 'text.secondary' : 'divider',
          '&:hover': { backgroundColor: 'action.hover', borderColor: 'text.primary' },
          '&:active': { backgroundColor: 'action.selected' },
        }}
      >
        Todos
      </Button>
      </SFlex>
      {actions}
      </SFlex>
    </SFlex>
  );
}
