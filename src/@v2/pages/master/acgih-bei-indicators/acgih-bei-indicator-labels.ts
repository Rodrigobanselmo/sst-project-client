import {
  AcgihBeiIndicatorConfidenceEnum,
  AcgihBeiIndicatorSourceEnum,
  AcgihBeiIndicatorStatusEnum,
} from '@v2/services/medicine/acgih-bei-indicator/service/acgih-bei-indicator.types';

export const acgihBeiStatusLabels: Record<AcgihBeiIndicatorStatusEnum, string> =
  {
    [AcgihBeiIndicatorStatusEnum.DRAFT]: 'Rascunho',
    [AcgihBeiIndicatorStatusEnum.ACTIVE]: 'Ativo',
    [AcgihBeiIndicatorStatusEnum.DEPRECATED]: 'Inativo',
  };

export const acgihBeiStatusColors: Record<
  AcgihBeiIndicatorStatusEnum,
  'default' | 'success' | 'warning'
> = {
  [AcgihBeiIndicatorStatusEnum.DRAFT]: 'warning',
  [AcgihBeiIndicatorStatusEnum.ACTIVE]: 'success',
  [AcgihBeiIndicatorStatusEnum.DEPRECATED]: 'default',
};

export const acgihBeiSourceLabels: Record<AcgihBeiIndicatorSourceEnum, string> =
  {
    [AcgihBeiIndicatorSourceEnum.ACGIH_BEI]: 'ACGIH / BEI',
    [AcgihBeiIndicatorSourceEnum.SIMPLE_SST]: 'SimpleSST',
    [AcgihBeiIndicatorSourceEnum.TECHNICAL]: 'Critério técnico',
    [AcgihBeiIndicatorSourceEnum.OTHER]: 'Outro',
  };

export const acgihBeiConfidenceLabels: Record<
  AcgihBeiIndicatorConfidenceEnum,
  string
> = {
  [AcgihBeiIndicatorConfidenceEnum.HIGH]: 'Alta',
  [AcgihBeiIndicatorConfidenceEnum.MEDIUM]: 'Média',
  [AcgihBeiIndicatorConfidenceEnum.LOW]: 'Baixa',
};

export const acgihBeiConfidenceColors: Record<
  AcgihBeiIndicatorConfidenceEnum,
  'default' | 'success' | 'warning' | 'error'
> = {
  [AcgihBeiIndicatorConfidenceEnum.HIGH]: 'success',
  [AcgihBeiIndicatorConfidenceEnum.MEDIUM]: 'warning',
  [AcgihBeiIndicatorConfidenceEnum.LOW]: 'error',
};
