import { Box, Tooltip, Typography } from '@mui/material';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import {
  resolveAxisLevelTooltip,
  type CoverageSubtypeInput,
} from '@v2/services/security/risk-matrix/presentation/axis-level-tooltip.util';
import { resolveSystemAxisLevelChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import { OccupationalRiskResultPill } from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import type { OccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

const PROBABILITY_AXIS_LABEL: Record<number, string> = {
  1: 'Desprezível',
  2: 'Pequena',
  3: 'Moderada',
  4: 'Significativa',
  5: 'Excessiva',
};

const SEVERITY_AXIS_LABEL: Record<number, string> = {
  1: 'Desprezível',
  2: 'Pequena',
  3: 'Moderada',
  4: 'Significante',
  5: 'Excessiva',
};

function axisValue(value?: number | null): number | null {
  if (typeof value === 'number' && value >= 1 && value <= 5) return value;
  return null;
}

export type FrpsRiskSubtypeRef = {
  sub_type?: {
    id?: number | string;
    name?: string;
    sub_type?: string | null;
    slug?: string | null;
  } | null;
};

export type FrpsMatrixEquationProps = {
  probability?: number | null;
  severity?: number | null;
  resultLevel?: OccupationalRiskLevel | null;
  riskType?: string | null;
  riskSubTypes?: readonly FrpsRiskSubtypeRef[] | null;
};

export function FrpsMatrixEquation({
  probability,
  severity,
  resultLevel,
  riskType,
  riskSubTypes,
}: FrpsMatrixEquationProps) {
  const presentation = useSystemRiskMatrixPresentation();
  const probabilityValue = axisValue(probability);
  const severityValue = axisValue(severity);
  const resultLabel =
    resultLevel != null ? matrixRiskMap[resultLevel].label : 'Não informado';

  const tooltipFor = (kind: 'P' | 'S', value: number | null) => {
    const official = resolveAxisLevelTooltip({
      kind,
      value,
      systemAxisLevels: presentation?.axisLevels,
      extraordinaryLabel: presentation?.extraordinaryProbability?.label,
      riskType,
      subTypes: riskSubTypes as CoverageSubtypeInput[] | null | undefined,
    });
    if (official) {
      return official.criterion
        ? `${official.heading}\n${official.criterion}`
        : official.heading;
    }
    if (value == null) {
      return kind === 'P' ? 'Probabilidade não informada' : 'Severidade não informada';
    }
    const label =
      kind === 'P' ? PROBABILITY_AXIS_LABEL[value] : SEVERITY_AXIS_LABEL[value];
    return `${kind}${value} — ${label}`;
  };

  const scalePill = (kind: 'P' | 'S', value: number | null) => (
    <Tooltip
      title={
        <Box component="span" sx={{ whiteSpace: 'pre-line', display: 'block' }}>
          {tooltipFor(kind, value)}
        </Box>
      }
      placement="top"
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <SScaleFactorPill
          kind={kind}
          value={value}
          chipColors={
            value != null
              ? resolveSystemAxisLevelChipColors(value, presentation)
              : undefined
          }
        />
      </Box>
    </Tooltip>
  );

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        flexShrink: 0,
        flexWrap: 'nowrap',
      }}
    >
      {scalePill('P', probabilityValue)}
      <Typography
        component="span"
        sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', lineHeight: 1 }}
      >
        e
      </Typography>
      {scalePill('S', severityValue)}
      <Typography
        component="span"
        sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', lineHeight: 1 }}
      >
        →
      </Typography>
      <Tooltip title={`Risco ocupacional: ${resultLabel}`} placement="top">
        <Box component="span" sx={{ display: 'inline-flex' }}>
          <OccupationalRiskResultPill label={resultLabel} level={resultLevel} />
        </Box>
      </Tooltip>
    </Box>
  );
}
