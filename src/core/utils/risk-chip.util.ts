import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { RiskEnum, RiskMap } from 'project/enum/risk.enums';

/** Largura do chip para rótulos compostos `ERG-*`. */
export const RISK_CHIP_WIDTH_COMPOUND_PX = 94;
/** Largura para nomes por extenso e demais rótulos do grupo simples. */
export const RISK_CHIP_WIDTH_SIMPLE_PX = 86;

/** Ordem: primeiro match quando houver vários (ex.: prioriza Psicossociais). */
export const SUBTYPE_CHIP_BY_NAME: Record<
  string,
  { suffix: string; colorKey: string }
> = {
  Psicossociais: { suffix: 'PSIC', colorKey: 'risk.psic' },
  Biomecânicos: { suffix: 'BIOM', colorKey: 'risk.ergSubtypeBiom' },
  Ambientais: { suffix: 'AMB', colorKey: 'risk.ergSubtypeAmb' },
  Organizacionais: { suffix: 'ORG', colorKey: 'risk.ergSubtypeOrg' },
  'Mobiliário e Equipamentos': { suffix: 'MOB', colorKey: 'risk.ergSubtypeMob' },
};

export function hasMappedErgonomicSubtype(risk: IRiskFactors): boolean {
  if (risk.type !== RiskEnum.ERG) return false;
  return Object.keys(SUBTYPE_CHIP_BY_NAME).some((name) =>
    risk.subTypes?.some((s) => s?.sub_type?.name === name),
  );
}

export function resolveRiskChip(riskFactor: IRiskFactors): {
  label: string;
  colorKey: string;
  chipWidthPx: number;
  isPsicChip: boolean;
} {
  for (const name of Object.keys(SUBTYPE_CHIP_BY_NAME)) {
    if (riskFactor.subTypes?.some((s) => s?.sub_type?.name === name)) {
      const { suffix, colorKey } = SUBTYPE_CHIP_BY_NAME[name];
      const label =
        riskFactor.type === RiskEnum.ERG ? `ERG-${suffix}` : suffix;
      const chipWidthPx = label.startsWith('ERG-')
        ? RISK_CHIP_WIDTH_COMPOUND_PX
        : RISK_CHIP_WIDTH_SIMPLE_PX;
      return { label, colorKey, chipWidthPx, isPsicChip: colorKey === 'risk.psic' };
    }
  }

  const t = (riskFactor?.type ?? '').toString().toLowerCase();
  const rawType = riskFactor?.type;
  const label =
    rawType && rawType in RiskMap
      ? RiskMap[rawType as RiskEnum].name
      : rawType || '';

  return {
    label,
    colorKey: t ? (`risk.${t}` as const) : 'grey.500',
    chipWidthPx: RISK_CHIP_WIDTH_SIMPLE_PX,
    isPsicChip: false,
  };
}

/** Chave de filtro alinhada ao chip (ex.: ERG-PSIC ou FIS). */
export function getRiskFilterKey(risk: IRiskFactors): string {
  const { label } = resolveRiskChip(risk);
  if (risk.type === RiskEnum.ERG && label.startsWith('ERG-')) return label;
  return risk.type;
}

export function riskMatchesActiveFilters(
  risk: IRiskFactors,
  activeFilters: string[],
): boolean {
  if (activeFilters.length === 0) return true;

  return activeFilters.some((filter) => {
    if (filter === RiskEnum.ERG) {
      return risk.type === RiskEnum.ERG;
    }
    if (filter.startsWith('ERG-')) {
      return getRiskFilterKey(risk) === filter;
    }
    return risk.type === filter;
  });
}
