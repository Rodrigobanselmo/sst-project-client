import { Box } from '@mui/material';
import { FC } from 'react';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { resolveSystemOccupationalChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { resolveDisplayedOccupationalChipColorsFromHex } from 'core/utils/helpers/matriz';

/**
 * Pill de RO/residual (recolhido e expandido).
 * Largura mínima cobre labels CUSTOM longos (“Não Tolerável”) sem truncar.
 */
export const OCCUPATIONAL_RISK_RESULT_PILL_MIN_WIDTH = 108;

export type OccupationalRiskResultPillProps = {
  label?: string | null;
  level?: number | null;
  /** Hex CUSTOM do snapshot; quando presente, não usa cor SimpleSST do level. */
  resultColor?: string | null;
  /** No grid expandido: alinha ao topo da célula (junto da Probabilidade). */
  alignSelfStart?: boolean;
};

export const OccupationalRiskResultPill: FC<OccupationalRiskResultPillProps> = ({
  label,
  level,
  resultColor,
  alignSelfStart = false,
}) => {
  const presentation = useSystemRiskMatrixPresentation();
  const customChip = resolveDisplayedOccupationalChipColorsFromHex(resultColor);
  const hasLevel = typeof level === 'number' && level > 0;
  const chip =
    customChip ??
    (hasLevel
      ? resolveSystemOccupationalChipColors(level, presentation)
      : { bgcolor: 'grey.200', color: 'text.secondary' });

  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: alignSelfStart ? 'start' : undefined,
        minWidth: OCCUPATIONAL_RISK_RESULT_PILL_MIN_WIDTH,
        width: OCCUPATIONAL_RISK_RESULT_PILL_MIN_WIDTH,
        height: 24,
        maxHeight: 24,
        px: 1,
        py: 0,
        borderRadius: '999px',
        backgroundColor: chip.bgcolor,
        color: chip.color,
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
        textAlign: 'center',
        overflow: 'visible',
        boxShadow: '0px 1px 1px 0px rgb(0 0 0 / 5%)',
        boxSizing: 'border-box',
      }}
    >
      {label?.trim() || '--'}
    </Box>
  );
};
