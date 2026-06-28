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

/** 4L.1b — explicação por classificação (tooltip/legenda). */
export const comparisonStatusExplanations: Record<
  AcgihBeiComparisonStatusEnum,
  string
> = {
  [AcgihBeiComparisonStatusEnum.ALREADY_COVERED]:
    'ACGIH/BEI confirma item já coberto pela NR-7/Biblioteca; pode servir como fonte complementar quando houver regra vinculada.',
  [AcgihBeiComparisonStatusEnum.DIVERGENT]:
    'Há divergência técnica relevante entre ACGIH/BEI e NR-7/Biblioteca; revisar campos comparados.',
  [AcgihBeiComparisonStatusEnum.NEEDS_REVIEW]:
    'Correspondência parcial ou ambígua; revisar antes de qualquer decisão.',
  [AcgihBeiComparisonStatusEnum.NEW_CANDIDATE]:
    'Possível candidato futuro para regra da Biblioteca; não cria regra automaticamente.',
  [AcgihBeiComparisonStatusEnum.LOW_CONFIDENCE_REVIEW]:
    'Transcrição ACGIH/BEI com baixa confiança; revisar fonte antes de usar.',
};

/** 4L.1b — explicação por ação sugerida (tooltip/legenda). */
export const suggestedActionExplanations: Record<
  AcgihBeiSuggestedActionEnum,
  string
> = {
  [AcgihBeiSuggestedActionEnum.ADD_REFERENCE_ONLY]:
    'Sugere registrar a ACGIH/BEI como fonte complementar de uma regra existente. Não cria regra nova.',
  [AcgihBeiSuggestedActionEnum.REVIEW_DIVERGENCE]:
    'Revisar a diferença técnica antes de qualquer uso. Nenhuma ação automática.',
  [AcgihBeiSuggestedActionEnum.CREATE_NEW_RULE_CANDIDATE]:
    'Separar como candidato para fase futura de candidatos formais. Não cria regra nesta fase.',
  [AcgihBeiSuggestedActionEnum.IGNORE_OR_MONITOR]:
    'Monitorar/revisar equivalência. Nenhuma ação automática.',
  [AcgihBeiSuggestedActionEnum.LOW_CONFIDENCE_REVIEW]:
    'Revisar a transcrição do item ACGIH/BEI contra a fonte.',
};

/** 4L.1b — próximo passo curto por classificação. */
export const comparisonNextStep: Record<AcgihBeiComparisonStatusEnum, string> = {
  [AcgihBeiComparisonStatusEnum.ALREADY_COVERED]:
    'Próximo passo: avaliar fonte complementar, se tecnicamente seguro.',
  [AcgihBeiComparisonStatusEnum.DIVERGENT]:
    'Próximo passo: revisar a diferença técnica entre ACGIH/BEI e NR-7.',
  [AcgihBeiComparisonStatusEnum.NEEDS_REVIEW]:
    'Próximo passo: verificar o match parcial/ambíguo nas bases de origem.',
  [AcgihBeiComparisonStatusEnum.NEW_CANDIDATE]:
    'Próximo passo: separar para fase futura de candidatos.',
  [AcgihBeiComparisonStatusEnum.LOW_CONFIDENCE_REVIEW]:
    'Próximo passo: revisar o item ACGIH/BEI na base de origem.',
};

export type RuleMatchMethod = 'VIA_NR7' | 'VIA_AGENT' | null;

export const ruleMatchMethodLabels: Record<'VIA_NR7' | 'VIA_AGENT', string> = {
  VIA_NR7: 'via NR-7',
  VIA_AGENT: 'via agente',
};

export const ruleMatchMethodTooltips: Record<'VIA_NR7' | 'VIA_AGENT', string> = {
  VIA_NR7: 'Match apoiado em indicador NR-7 (proveniência da regra).',
  VIA_AGENT: 'Match mais fraco por agente/substância (CAS ou nome).',
};
