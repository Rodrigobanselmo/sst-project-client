import { RiskMatrixSourceEnum } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

export type AxisLevelTooltipItem = {
  axis: string;
  value: number;
  label?: string | null;
  criteriaByCoverage?: Array<{
    coverageKey: string;
    criterion?: string | null;
  }> | null;
};

const COVERAGE_KEYS = new Set([
  'FIS',
  'QUI',
  'BIO',
  'ACI',
  'ERG',
  'PSICOSOCIAL',
]);

export type CoverageSubtypeInput =
  | string
  | {
      subType?: string | null;
      sub_type?:
        | string
        | {
            id?: string;
            name?: string;
            sub_type?: string | null;
            slug?: string | null;
          }
        | null;
      slug?: string | null;
    };

const isPsychosocial = (item: CoverageSubtypeInput): boolean => {
  if (typeof item === 'string') return item === 'PSICOSOCIAL';
  if (item.subType === 'PSICOSOCIAL' || item.slug === 'psicosocial') return true;
  const nested = item.sub_type;
  if (typeof nested === 'string') return nested === 'PSICOSOCIAL';
  return nested?.sub_type === 'PSICOSOCIAL' || nested?.slug === 'psicosocial';
};

/**
 * Mesma decisão de `resolveRiskMatrixCoverageKey` na API.
 * `evaluatedCoverageKey` vence. Sem chave válida, não escolhe a primeira cobertura.
 */
export function resolveDisplayedAxisCoverage(params: {
  evaluatedCoverageKey?: string | null;
  riskType?: string | null;
  subTypes?: CoverageSubtypeInput[] | null;
}): string | null {
  if (params.evaluatedCoverageKey && COVERAGE_KEYS.has(params.evaluatedCoverageKey)) {
    return params.evaluatedCoverageKey;
  }

  const riskType = params.riskType;
  if (!riskType || riskType === 'OUTROS') return null;
  if (riskType === 'ERG') {
    return params.subTypes?.some(isPsychosocial) ? 'PSICOSOCIAL' : 'ERG';
  }
  if (COVERAGE_KEYS.has(riskType)) return riskType;
  return null;
}

const text = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : '';
};

export type AxisLevelTooltipContent = {
  heading: string;
  criterion: string | null;
};

/**
 * Texto do hover do chip Pn/Sn.
 * Null quando não há label nem criterion — o chip fica sem tooltip.
 */
export function formatAxisLevelTooltip(params: {
  kind: 'P' | 'S';
  value?: number | null;
  coverageKey?: string | null;
  levels?: AxisLevelTooltipItem[] | null;
  extraordinaryLabel?: string | null;
}): AxisLevelTooltipContent | null {
  const value = params.value;
  if (typeof value !== 'number' || value <= 0) return null;

  const code = `${params.kind}${value}`;

  if (params.kind === 'P' && value >= 6) {
    const label = text(params.extraordinaryLabel);
    return label ? { heading: `${code} — ${label}`, criterion: null } : null;
  }

  const axis = params.kind === 'P' ? 'PROBABILITY' : 'SEVERITY';
  const level = params.levels?.find((item) => item.axis === axis && item.value === value);
  const label = text(level?.label);
  const criterion = params.coverageKey
    ? text(
        level?.criteriaByCoverage?.find((item) => item.coverageKey === params.coverageKey)
          ?.criterion,
      )
    : '';

  if (!label && !criterion) return null;
  return {
    heading: label ? `${code} — ${label}` : code,
    criterion: criterion || null,
  };
}

/** CUSTOM usa a versão pinada. SYSTEM usa a apresentação SYSTEM, inclusive o P6. */
export function resolveAxisLevelTooltip(params: {
  kind: 'P' | 'S';
  value?: number | null;
  matrixSource?: string | null;
  pinnedAxisLevels?: AxisLevelTooltipItem[] | null;
  systemAxisLevels?: AxisLevelTooltipItem[] | null;
  extraordinaryLabel?: string | null;
  evaluatedCoverageKey?: string | null;
  riskType?: string | null;
  subTypes?: CoverageSubtypeInput[] | null;
}): AxisLevelTooltipContent | null {
  const isCustom = params.matrixSource === RiskMatrixSourceEnum.CUSTOM;
  return formatAxisLevelTooltip({
    kind: params.kind,
    value: params.value,
    coverageKey: resolveDisplayedAxisCoverage({
      evaluatedCoverageKey: params.evaluatedCoverageKey,
      riskType: params.riskType,
      subTypes: params.subTypes,
    }),
    levels: isCustom ? params.pinnedAxisLevels : params.systemAxisLevels,
    extraordinaryLabel: isCustom ? null : params.extraordinaryLabel,
  });
}
