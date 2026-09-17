import { Box } from '@mui/material';

import {
  formatSimpleSstScaleFactorLabel,
  getSimpleSstScaleChipColors,
  SimpleSstScaleFactorKind,
} from 'core/utils/helpers/simple-sst-scale-chip.util';

export type SScaleFactorPillProps = {
  kind: SimpleSstScaleFactorKind;
  value?: number | null;
};

export function SScaleFactorPill({ kind, value }: SScaleFactorPillProps) {
  const hasValue = typeof value === 'number' && value > 0;
  const chip = hasValue
    ? getSimpleSstScaleChipColors(Math.min(value, 6))
    : { bgcolor: 'grey.200', color: 'text.secondary' };

  return (
    <Box
      component="span"
      aria-label={
        hasValue
          ? `${kind === 'S' ? 'Severidade' : 'Probabilidade'} ${value}`
          : undefined
      }
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: 34,
        height: 22,
        px: 1.5,
        flexShrink: 0,
        borderRadius: '999px',
        backgroundColor: chip.bgcolor,
        color: chip.color,
        fontSize: 11,
        fontWeight: 700,
        lineHeight: 1,
        letterSpacing: 0.2,
        boxShadow: '0px 1px 1px 0px rgb(0 0 0 / 5%)',
      }}
    >
      {formatSimpleSstScaleFactorLabel(kind, hasValue ? value : null)}
    </Box>
  );
}
