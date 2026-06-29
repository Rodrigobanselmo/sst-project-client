import {
  AcgihBeiComparisonDecisionEnum,
  AcgihBeiComparisonStatusEnum,
  AcgihBeiMatchStatusEnum,
  AcgihBeiOperationalStatusEnum,
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

/** 4O.3/4O.4 — rótulos/cores/explicação do status operacional/efetivo. */
export const operationalStatusLabels: Record<
  AcgihBeiOperationalStatusEnum,
  string
> = {
  [AcgihBeiOperationalStatusEnum.ALREADY_COVERED]: 'Já coberto',
  [AcgihBeiOperationalStatusEnum.DIVERGENT]: 'Divergente',
  [AcgihBeiOperationalStatusEnum.NEEDS_REVIEW]: 'Requer revisão',
  [AcgihBeiOperationalStatusEnum.NEW_CANDIDATE]: 'Candidato novo',
  [AcgihBeiOperationalStatusEnum.LOW_CONFIDENCE_REVIEW]: 'Baixa confiança',
  [AcgihBeiOperationalStatusEnum.RESOLVED_EQUIVALENCE]:
    'Resolvido por equivalência',
  // 4O.4 — buckets operacionais derivados da decisão técnica.
  [AcgihBeiOperationalStatusEnum.REAL_DIVERGENCE]: 'Divergência técnica real',
  [AcgihBeiOperationalStatusEnum.SOURCE_ACGIH_ERROR]: 'Erro na base ACGIH/BEI',
  [AcgihBeiOperationalStatusEnum.SOURCE_NR7_ERROR]: 'Erro na base NR-7',
  [AcgihBeiOperationalStatusEnum.NEEDS_FURTHER_REVIEW]: 'Pendente (decisão)',
  [AcgihBeiOperationalStatusEnum.IGNORE_MONITOR]: 'Monitorar / ignorar',
};

export const operationalStatusColors: Record<
  AcgihBeiOperationalStatusEnum,
  ChipColor
> = {
  [AcgihBeiOperationalStatusEnum.ALREADY_COVERED]: 'success',
  [AcgihBeiOperationalStatusEnum.DIVERGENT]: 'warning',
  [AcgihBeiOperationalStatusEnum.NEEDS_REVIEW]: 'info',
  [AcgihBeiOperationalStatusEnum.NEW_CANDIDATE]: 'default',
  [AcgihBeiOperationalStatusEnum.LOW_CONFIDENCE_REVIEW]: 'error',
  [AcgihBeiOperationalStatusEnum.RESOLVED_EQUIVALENCE]: 'success',
  // 4O.4 — alinhado às cores das decisões técnicas correspondentes.
  [AcgihBeiOperationalStatusEnum.REAL_DIVERGENCE]: 'error',
  [AcgihBeiOperationalStatusEnum.SOURCE_ACGIH_ERROR]: 'warning',
  [AcgihBeiOperationalStatusEnum.SOURCE_NR7_ERROR]: 'warning',
  [AcgihBeiOperationalStatusEnum.NEEDS_FURTHER_REVIEW]: 'info',
  [AcgihBeiOperationalStatusEnum.IGNORE_MONITOR]: 'default',
};

export const operationalStatusExplanations: Record<
  AcgihBeiOperationalStatusEnum,
  string
> = {
  [AcgihBeiOperationalStatusEnum.ALREADY_COVERED]:
    'ACGIH/BEI confirma item já coberto pela NR-7/Biblioteca.',
  [AcgihBeiOperationalStatusEnum.DIVERGENT]:
    'Divergência técnica relevante ainda em aberto (sem decisão de equivalência).',
  [AcgihBeiOperationalStatusEnum.NEEDS_REVIEW]:
    'Pendente de decisão técnica humana.',
  [AcgihBeiOperationalStatusEnum.NEW_CANDIDATE]:
    'Sem equivalência clara; possível candidato futuro.',
  [AcgihBeiOperationalStatusEnum.LOW_CONFIDENCE_REVIEW]:
    'Transcrição ACGIH/BEI com baixa confiança; revisar fonte.',
  [AcgihBeiOperationalStatusEnum.RESOLVED_EQUIVALENCE]:
    'Divergência resolvida por decisão técnica humana (equivalência / falso divergente). O status bruto calculado permanece preservado.',
  // 4O.4 — o status bruto calculado permanece preservado para auditoria.
  [AcgihBeiOperationalStatusEnum.REAL_DIVERGENCE]:
    'Revisada e confirmada como divergência técnica real. Saiu da fila de pendentes; o status bruto calculado permanece preservado.',
  [AcgihBeiOperationalStatusEnum.SOURCE_ACGIH_ERROR]:
    'Revisada: indício de erro/transcrição na base ACGIH/BEI. O status bruto calculado permanece preservado.',
  [AcgihBeiOperationalStatusEnum.SOURCE_NR7_ERROR]:
    'Revisada: indício de erro/transcrição na base NR-7. O status bruto calculado permanece preservado.',
  [AcgihBeiOperationalStatusEnum.NEEDS_FURTHER_REVIEW]:
    'Revisada, mas marcada como pendente de mais análise (decisão registrada). Saiu da fila automática de pendentes.',
  [AcgihBeiOperationalStatusEnum.IGNORE_MONITOR]:
    'Revisada: manter em monitoramento, sem ação necessária agora. O status bruto calculado permanece preservado.',
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

/** 4O.1 — rótulos da decisão técnica de curadoria. */
export const comparisonDecisionLabels: Record<
  AcgihBeiComparisonDecisionEnum,
  string
> = {
  [AcgihBeiComparisonDecisionEnum.FALSE_DIVERGENCE_EQUIVALENT]:
    'Equivalência técnica / falso divergente',
  [AcgihBeiComparisonDecisionEnum.REAL_DIVERGENCE]: 'Divergência técnica real',
  [AcgihBeiComparisonDecisionEnum.SOURCE_ACGIH_ERROR]: 'Erro na base ACGIH/BEI',
  [AcgihBeiComparisonDecisionEnum.SOURCE_NR7_ERROR]: 'Erro na base NR-7',
  [AcgihBeiComparisonDecisionEnum.NEEDS_FURTHER_REVIEW]: 'Pendente de revisão',
  [AcgihBeiComparisonDecisionEnum.IGNORE_MONITOR]: 'Monitorar / ignorar',
};

export const comparisonDecisionColors: Record<
  AcgihBeiComparisonDecisionEnum,
  ChipColor
> = {
  [AcgihBeiComparisonDecisionEnum.FALSE_DIVERGENCE_EQUIVALENT]: 'success',
  [AcgihBeiComparisonDecisionEnum.REAL_DIVERGENCE]: 'error',
  [AcgihBeiComparisonDecisionEnum.SOURCE_ACGIH_ERROR]: 'warning',
  [AcgihBeiComparisonDecisionEnum.SOURCE_NR7_ERROR]: 'warning',
  [AcgihBeiComparisonDecisionEnum.NEEDS_FURTHER_REVIEW]: 'info',
  [AcgihBeiComparisonDecisionEnum.IGNORE_MONITOR]: 'default',
};

export const comparisonDecisionExplanations: Record<
  AcgihBeiComparisonDecisionEnum,
  string
> = {
  [AcgihBeiComparisonDecisionEnum.FALSE_DIVERGENCE_EQUIVALENT]:
    'A divergência apontada é apenas nomenclatural/operacional; tecnicamente equivalente.',
  [AcgihBeiComparisonDecisionEnum.REAL_DIVERGENCE]:
    'Há divergência técnica real entre ACGIH/BEI e NR-7 que exige atenção.',
  [AcgihBeiComparisonDecisionEnum.SOURCE_ACGIH_ERROR]:
    'Indício de erro/transcrição incorreta na base ACGIH/BEI.',
  [AcgihBeiComparisonDecisionEnum.SOURCE_NR7_ERROR]:
    'Indício de erro/transcrição incorreta na base NR-7.',
  [AcgihBeiComparisonDecisionEnum.NEEDS_FURTHER_REVIEW]:
    'Decisão pendente; requer mais análise antes de concluir.',
  [AcgihBeiComparisonDecisionEnum.IGNORE_MONITOR]:
    'Sem ação necessária agora; manter em monitoramento.',
};
