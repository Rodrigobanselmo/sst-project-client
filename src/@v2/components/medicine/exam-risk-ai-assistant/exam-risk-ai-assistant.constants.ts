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

export const EXAM_RISK_AI_ANALYSIS_STATUS_LABELS = {
  AI_ANALYZED: 'IA analisou',
  AI_FALLBACK: 'Fallback IA',
  AI_MISSING_ITEM: 'Par ausente',
} as const;

export const EXAM_RISK_AI_ANALYSIS_STATUS_COLORS = {
  AI_ANALYZED: 'success',
  AI_FALLBACK: 'error',
  AI_MISSING_ITEM: 'warning',
} as const;

export const EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS = {
  DIRECT: 'Direta',
  POSSIBLE: 'Possível',
  LOW_RELEVANCE: 'Baixa',
  UNASSESSED: 'Sem foco',
} as const;

export const EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS = {
  DIRECT: 'success',
  POSSIBLE: 'info',
  LOW_RELEVANCE: 'warning',
  UNASSESSED: 'default',
} as const;
