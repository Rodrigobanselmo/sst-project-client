import {
  AcgihBeiComparisonStatusEnum,
  AcgihBeiMatchStatusEnum,
  AcgihBeiSuggestedActionEnum,
} from '@v2/services/medicine/acgih-bei-comparison/service/acgih-bei-comparison.types';

type ChipColor = 'default' | 'success' | 'warning' | 'error' | 'info';

export const comparisonStatusLabels: Record<
  AcgihBeiComparisonStatusEnum,
  string
> = {
  [AcgihBeiComparisonStatusEnum.ALREADY_COVERED]: 'Já coberto',
  [AcgihBeiComparisonStatusEnum.DIVERGENT]: 'Divergente',
  [AcgihBeiComparisonStatusEnum.NEEDS_REVIEW]: 'Requer revisão',
  [AcgihBeiComparisonStatusEnum.NEW_CANDIDATE]: 'Candidato novo',
  [AcgihBeiComparisonStatusEnum.LOW_CONFIDENCE_REVIEW]: 'Baixa confiança',
};

export const comparisonStatusColors: Record<
  AcgihBeiComparisonStatusEnum,
  ChipColor
> = {
  [AcgihBeiComparisonStatusEnum.ALREADY_COVERED]: 'success',
  [AcgihBeiComparisonStatusEnum.DIVERGENT]: 'warning',
  [AcgihBeiComparisonStatusEnum.NEEDS_REVIEW]: 'info',
  [AcgihBeiComparisonStatusEnum.NEW_CANDIDATE]: 'default',
  [AcgihBeiComparisonStatusEnum.LOW_CONFIDENCE_REVIEW]: 'error',
};

export const suggestedActionLabels: Record<
  AcgihBeiSuggestedActionEnum,
  string
> = {
  [AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY]: 'Sugerir fonte complementar',
  [AcgihBeiSuggestedActionEnum.REVIEW_DIVERGENCE]: 'Revisar divergência',
  [AcgihBeiSuggestedActionEnum.CREATE_NEW_RULE_CANDIDATE]:
    'Avaliar nova regra (candidato)',
  [AcgihBeiSuggestedActionEnum.IGNORE_OR_MONITOR]: 'Ignorar / monitorar',
  [AcgihBeiSuggestedActionEnum.LOW_CONFIDENCE_REVIEW]: 'Revisar transcrição',
};

export const matchStatusLabels: Record<AcgihBeiMatchStatusEnum, string> = {
  [AcgihBeiMatchStatusEnum.FULL]: 'Plena',
  [AcgihBeiMatchStatusEnum.PARTIAL]: 'Parcial',
  [AcgihBeiMatchStatusEnum.NONE]: 'Sem match',
};

export const matchStatusColors: Record<AcgihBeiMatchStatusEnum, ChipColor> = {
  [AcgihBeiMatchStatusEnum.FULL]: 'success',
  [AcgihBeiMatchStatusEnum.PARTIAL]: 'warning',
  [AcgihBeiMatchStatusEnum.NONE]: 'default',
};
