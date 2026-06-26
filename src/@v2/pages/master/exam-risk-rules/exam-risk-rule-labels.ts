import {
  ExamRiskRuleCategoryEnum,
  ExamRiskRuleScopeEnum,
  ExamRiskRuleSourceEnum,
  ExamRiskRuleStatusEnum,
} from '@v2/services/medicine/exam-risk-rule/service/exam-risk-rule.types';

export const examRiskRuleScopeLabels: Record<ExamRiskRuleScopeEnum, string> = {
  [ExamRiskRuleScopeEnum.RISK]: 'Risco específico',
  [ExamRiskRuleScopeEnum.GROUP]: 'Grupo/subtipo',
  [ExamRiskRuleScopeEnum.CATEGORY]: 'Categoria',
  [ExamRiskRuleScopeEnum.AGENT]: 'Agente/substância',
};

export const examRiskRuleSourceLabels: Record<ExamRiskRuleSourceEnum, string> = {
  [ExamRiskRuleSourceEnum.NR_07]: 'NR-07',
  [ExamRiskRuleSourceEnum.SIMPLE_SST]: 'SimpleSST',
  [ExamRiskRuleSourceEnum.TECHNICAL]: 'Critério técnico',
  [ExamRiskRuleSourceEnum.OTHER]: 'Outro',
};

export const examRiskRuleStatusLabels: Record<ExamRiskRuleStatusEnum, string> = {
  [ExamRiskRuleStatusEnum.DRAFT]: 'Rascunho',
  [ExamRiskRuleStatusEnum.ACTIVE]: 'Ativo',
  [ExamRiskRuleStatusEnum.DEPRECATED]: 'Inativo',
};

export const examRiskRuleStatusColors: Record<
  ExamRiskRuleStatusEnum,
  'default' | 'success' | 'warning'
> = {
  [ExamRiskRuleStatusEnum.DRAFT]: 'warning',
  [ExamRiskRuleStatusEnum.ACTIVE]: 'success',
  [ExamRiskRuleStatusEnum.DEPRECATED]: 'default',
};

export const examRiskRuleDraftReasonLabels: Record<string, string> = {
  INDICATOR_NOT_ACTIVE: 'Indicador biológico não está ATIVO na base NR-07',
  INDICATOR_DELETED: 'Indicador biológico removido',
  RISK_NOT_CONFIRMED: 'Risco não confirmado',
  RISK_PRIMARY_REQUIRED: 'Falta definir o risco principal',
  EXAM_NOT_CONFIRMED: 'Exame não confirmado',
  EXAM_DEFAULT_REQUIRED: 'Falta marcar o exame padrão',
  NORMATIVE_REVIEW_REQUIRED: 'Revisão normativa/médica pendente',
  RISK_NOT_SYSTEM: 'Risco fora do catálogo sistêmico',
  EXAM_NOT_SYSTEM: 'Exame fora do catálogo sistêmico',
  RISK_DELETED: 'Risco principal removido do catálogo',
  EXAM_DELETED: 'Exame padrão removido do catálogo',
  RISK_LINK_DELETED: 'Vínculo de risco removido',
  EXAM_LINK_DELETED: 'Vínculo de exame removido',
  AGENT_MISSING: 'Agente/substância não identificado',
};

export const examRiskRuleCategoryLabels: Record<
  ExamRiskRuleCategoryEnum,
  string
> = {
  [ExamRiskRuleCategoryEnum.BIO]: 'Biológico',
  [ExamRiskRuleCategoryEnum.QUI]: 'Químico',
  [ExamRiskRuleCategoryEnum.FIS]: 'Físico',
  [ExamRiskRuleCategoryEnum.ERG]: 'Ergonômico',
  [ExamRiskRuleCategoryEnum.ACI]: 'Acidente',
  [ExamRiskRuleCategoryEnum.OUTROS]: 'Outros',
};
