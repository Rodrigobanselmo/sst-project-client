import { Box, Tooltip, Typography } from '@mui/material';

import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import {
  resolveAxisLevelTooltip,
  type CoverageSubtypeInput,
} from '@v2/services/security/risk-matrix/presentation/axis-level-tooltip.util';
import { resolveSystemAxisLevelChipColors } from '@v2/services/security/risk-matrix/presentation/system-risk-matrix-presentation.util';
import { SScaleFactorPill } from 'components/atoms/SScaleFactorPill';
import { OccupationalRiskResultPill, OCCUPATIONAL_RISK_RESULT_PILL_MIN_WIDTH } from 'components/organisms/main/Tree/OrgTree/components/OccupationalRiskResultPill';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import type { OccupationalRiskLevel } from 'core/utils/helpers/occupational-risk-level.util';

const PROBABILITY_PILL_WIDTH = 120;

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
  protectedData?: boolean;
  minParticipants?: number;
  probability?: number | null;
  severity?: number | null;
  resultLevel?: OccupationalRiskLevel | null;
  riskType?: string | null;
  riskSubTypes?: readonly FrpsRiskSubtypeRef[] | null;
};

export function FrpsMatrixEquation({
  protectedData = false,
  minParticipants = 3,
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

  const protectedPill = (label: string) => (
    <Tooltip title={`Dados protegidos: este recorte não atinge o mínimo de ${minParticipants} respondentes. Use a aba Agrupamentos para reunir setores com contexto compatível, com apoio da IA, ou consulte o RH. A regra pode ser ajustada por um usuário autorizado nas configurações de SST.`}>
      <Box component="span" tabIndex={0} aria-label={`${label}: dados protegidos`}
        sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box', width: label === 'Probabilidade' ? PROBABILITY_PILL_WIDTH : OCCUPATIONAL_RISK_RESULT_PILL_MIN_WIDTH, height: label === 'Probabilidade' ? 22 : 24, px: 1, borderRadius: '999px', color: '#000000', backgroundColor: (theme) => theme.palette.mode === 'dark' ? '#59616D' : '#D1D5DB', fontSize: label === 'Probabilidade' ? 11 : 10, fontWeight: label === 'Probabilidade' ? 700 : 600, lineHeight: 1, whiteSpace: 'nowrap' }}>
        Protegido
      </Box>
    </Tooltip>
  );

  const scalePill = (kind: 'P' | 'S', value: number | null) => (
    <Tooltip
      title={
        <Box component="span" sx={{ whiteSpace: 'pre-line', display: 'block' }}>
          <Box component="span" sx={{ display: 'block', fontWeight: 700, mb: 2 }}>
            {kind === 'P' ? 'Probabilidade (P)' : 'Severidade (S)'}
          </Box>
          {tooltipFor(kind, value)}
        </Box>
      }
      placement="top"
    >
      <Box component="span" sx={{ display: 'inline-flex', ...(kind === 'P' ? { width: PROBABILITY_PILL_WIDTH, flexShrink: 0, '& > span': { width: '100%', boxSizing: 'border-box', whiteSpace: 'nowrap' } } : {}) }}>
        <SScaleFactorPill
          horizontalPadding={3}
          kind={kind}
          value={value}
          label={`${kind === 'P' ? 'Probabilidade' : 'Severidade'} ${value ?? 'não informada'}`}
          chipColors={
            value != null
              ? {
                  ...resolveSystemAxisLevelChipColors(value, presentation),
                  color: value === 5 ? '#FFFFFF' : '#000000',
                }
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
        flexWrap: 'wrap',
      }}
    >
      {protectedData ? protectedPill('Probabilidade') : scalePill('P', probabilityValue)}
      <Tooltip title="Cruzamento da probabilidade com a severidade na matriz de risco; não representa multiplicação aritmética.">
      <Typography
        component="span"
        sx={{ fontSize: 11, fontWeight: 500, color: 'text.secondary', lineHeight: 1 }}
      >
        ×
      </Typography>
      </Tooltip>
      {scalePill('S', severityValue)}
      <Typography
        component="span"
        sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary', lineHeight: 1 }}
      >
        →
      </Typography>
      {protectedData ? protectedPill('Risco ocupacional') : <Tooltip title={`Risco ocupacional: ${resultLabel}`} placement="top">
        <Box component="span" sx={{ display: 'inline-flex' }}>
          <OccupationalRiskResultPill label={resultLabel} level={resultLevel} textColor={resultLevel != null ? (resultLevel === 5 ? "#FFFFFF" : "#000000") : undefined} />
        </Box>
      </Tooltip>}
    </Box>
  );
}
