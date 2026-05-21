import { SUBTYPE_CHIP_BY_NAME } from 'core/utils/risk-chip.util';
import { RiskEnum } from 'project/enum/risk.enums';

export const riskFilter = [
  { label: 'FIS', filter: RiskEnum.FIS, activeColor: 'risk.fis' },
  { label: 'QUI', filter: RiskEnum.QUI, activeColor: 'risk.qui' },
  { label: 'BIO', filter: RiskEnum.BIO, activeColor: 'risk.bio' },
  { label: 'ACI', filter: RiskEnum.ACI, activeColor: 'risk.aci' },
  { label: 'ERG', filter: RiskEnum.ERG, activeColor: 'risk.erg' },
];

const ergSubtypeFilters = Object.values(SUBTYPE_CHIP_BY_NAME).map(
  ({ suffix, colorKey }) => ({
    label: `ERG-${suffix}`,
    filter: `ERG-${suffix}`,
    activeColor: colorKey,
    ...(colorKey === 'risk.psic' ? { activeTextColor: 'grey.900' as const } : {}),
  }),
);

/** Linha 1 do modal de seleção: tipos principais + outros. */
export const riskFilterMainRow = [
  ...riskFilter,
  { label: 'OUTROS', filter: RiskEnum.OUTROS, activeColor: 'risk.outros' },
];

/** Linha 2 do modal de seleção: subtipos ergonômicos. */
export const riskFilterErgonomicRow = ergSubtypeFilters;

/** Todas as opções (compatibilidade). */
export const riskFilterWithPsic = [
  ...riskFilterMainRow,
  ...riskFilterErgonomicRow,
];
