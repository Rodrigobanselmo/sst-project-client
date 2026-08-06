export const EXAM_RISK_AI_EXAM_TYPE_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'LAB', label: 'Laboratorial' },
  { value: 'AUDIO', label: 'Audiometria' },
  { value: 'VISUAL', label: 'Visual' },
  { value: 'OTHERS', label: 'Outros' },
] as const;

export const EXAM_RISK_AI_DEFAULT_LIMIT = 30;
export const EXAM_RISK_AI_MAX_LIMIT = 60;

export const EXAM_RISK_AI_DECISION_LABELS = {
  suggest: 'Sugerir',
  exclude: 'Excluir',
  ambiguous: 'Ambíguo',
} as const;

export const EXAM_RISK_AI_DECISION_COLORS = {
  suggest: 'success',
  exclude: 'default',
  ambiguous: 'warning',
} as const;

/** Presentation labels for AI verdicts — never show raw enums to end users. */
export const EXAM_RISK_AI_VERDICT_LABELS = {
  ADD: 'Recomenda incluir',
  ADD_CONDITIONALLY: 'Recomenda incluir mediante confirmação de condição',
  KEEP: 'Recomenda manter',
  KEEP_CONDITIONALLY: 'Recomenda manter mediante confirmação de condição',
  KEEP_LOCAL_JUSTIFIED: 'Recomenda manter (justificativa local)',
  DO_NOT_APPLY_IN_CONTEXT: 'Recomenda não aplicar neste contexto',
  INSUFFICIENT_CONTEXT: 'Informações insuficientes para concluir',
  MANUAL_REVIEW_REQUIRED: 'Revisão manual necessária',
  REVIEW_OFFICIAL_RULE: 'Sugere revisar o padrão oficial',
  ADJUST_CONFIG: 'Sugere ajustar a configuração',
  CONSIDER_REMOVE: 'Sugere considerar remoção',
} as const;

/** Shorter phrase after “recomendação da IA: …” */
export const EXAM_RISK_AI_VERDICT_RECOMMENDATION_PHRASES = {
  ADD: 'incluir',
  ADD_CONDITIONALLY: 'incluir mediante confirmação de condição',
  KEEP: 'manter',
  KEEP_CONDITIONALLY: 'manter mediante confirmação de condição',
  KEEP_LOCAL_JUSTIFIED: 'manter com justificativa local',
  DO_NOT_APPLY_IN_CONTEXT: 'não aplicar neste contexto',
  INSUFFICIENT_CONTEXT: 'informações insuficientes para concluir',
  MANUAL_REVIEW_REQUIRED: 'revisão manual necessária',
  REVIEW_OFFICIAL_RULE: 'revisar o padrão oficial',
  ADJUST_CONFIG: 'ajustar a configuração',
  CONSIDER_REMOVE: 'considerar remoção',
} as const;

export const EXAM_RISK_AI_ANALYSIS_STATUS_LABELS = {
  AI_ANALYZED: 'Avaliado pela IA',
  AI_FALLBACK: 'Revisão manual necessária',
  AI_MISSING_ITEM: 'Item não avaliado pela IA',
  AI_PARTIAL_PARSE: 'Resposta parcialmente processada',
} as const;

export const EXAM_RISK_AI_ANALYSIS_STATUS_COLORS = {
  AI_ANALYZED: 'success',
  AI_FALLBACK: 'error',
  AI_MISSING_ITEM: 'warning',
  AI_PARTIAL_PARSE: 'warning',
} as const;

export const EXAM_RISK_AI_ADOPTION_STATUS_LABELS = {
  NOT_ADOPTED: 'Não adotado',
  ADOPTED: 'Adotado',
  ADOPTED_EQUIVALENT: 'Adotado (equivalente)',
  ADOPTED_DIVERGENT: 'Adotado (divergente)',
  LOCAL_ONLY: 'Somente local',
} as const;

export const EXAM_RISK_AI_PURPOSE_LABELS = {
  OCCUPATIONAL_HEALTH_SURVEILLANCE: 'Vigilância à saúde ocupacional',
  SANITARY_COMPLIANCE: 'Conformidade sanitária',
  CONDITIONAL_REQUIREMENT: 'Exigência condicional',
  POST_EXPOSURE_OR_CLINICAL: 'Pós-exposição / clínico',
  NOT_APPLICABLE: 'Não aplicável',
  INSUFFICIENT_CONTEXT: 'Contexto insuficiente',
} as const;

export const EXAM_RISK_AI_RECOMMENDED_DECISION_STATUS_LABELS = {
  PENDING_REVIEW: 'Pendente de revisão',
  ADOPTED: 'Adotado',
  PARTIALLY_ADOPTED: 'Parcialmente adotado',
  DECLINED_TECHNICAL_DECISION: 'Declinado (decisão técnica)',
  CONDITIONAL: 'Condicional',
  NOT_APPLICABLE_TO_CONTEXT: 'Não aplicável ao contexto',
  NEEDS_MORE_INFORMATION: 'Necessita mais informações',
} as const;

export const EXAM_RISK_AI_PROTOCOL_ROLE_LABELS = {
  INCLUDE: 'Incluir',
  KEEP: 'Manter',
  CONDITIONAL: 'Condicional',
  DO_NOT_APPLY: 'Não aplicar',
  NEEDS_INFORMATION: 'Necessita informação',
  MANUAL_REVIEW: 'Revisão manual',
} as const;

export const EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS = {
  DIRECT: 'Direta',
  POSSIBLE: 'Possível',
  LOW_RELEVANCE: 'Baixa',
  UNASSESSED: 'Sem foco',
  official: 'Biblioteca Oficial',
  clinical: 'Exame Clínico Base',
  nr7: 'NR-7',
  acgih: 'ACGIH',
  adopted: 'Empresa',
  additional: 'IA Adicional',
} as const;

export const EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS = {
  DIRECT: 'success',
  POSSIBLE: 'info',
  LOW_RELEVANCE: 'warning',
  UNASSESSED: 'default',
  official: 'primary',
  clinical: 'secondary',
  nr7: 'info',
  acgih: 'info',
  adopted: 'default',
  additional: 'warning',
} as const;
