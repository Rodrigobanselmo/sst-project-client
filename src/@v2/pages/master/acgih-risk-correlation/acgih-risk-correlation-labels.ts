import type {
  AcgihExamPreviewStatus,
  AcgihRiskCorrelationCardinality,
  AcgihRiskCorrelationConfidence,
  AcgihRiskCorrelationDecisionSource,
  AcgihRiskCorrelationFinalStatus,
  AcgihRiskCorrelationMatchMethod,
  IAcgihExamPreviewLink,
} from '@v2/services/medicine/acgih-risk-correlation/service/acgih-risk-correlation.types';

type ChipColor =
  | 'default'
  | 'primary'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export const finalStatusLabels: Record<AcgihRiskCorrelationFinalStatus, string> =
  {
    MATCH_REUSED_NR7: 'Reuso NR-7',
    MATCH_CAS_EXACT: 'CAS exato',
    MATCH_CAS_IN_GROUP: 'CAS em grupo',
    MATCH_NAME: 'Nome/sinônimo',
    AMBIGUOUS: 'Ambíguo',
    NO_MATCH: 'Sem correspondência',
    ALREADY_LINKED: 'Já vinculado',
    ACEITAR_CANONICO: 'Aceitar canônico (manual)',
    ACEITAR_GRUPO: 'Aceitar grupo (manual)',
    ACEITAR_MULTIPLO_CANONICO: 'Aceitar múltiplo (manual)',
    OVERRIDE_TARGET_MISSING: 'Alvo de override ausente',
  };

export const finalStatusColors: Record<
  AcgihRiskCorrelationFinalStatus,
  ChipColor
> = {
  MATCH_REUSED_NR7: 'success',
  MATCH_CAS_EXACT: 'success',
  MATCH_CAS_IN_GROUP: 'info',
  MATCH_NAME: 'info',
  AMBIGUOUS: 'warning',
  NO_MATCH: 'error',
  ALREADY_LINKED: 'success',
  ACEITAR_CANONICO: 'success',
  ACEITAR_GRUPO: 'info',
  ACEITAR_MULTIPLO_CANONICO: 'info',
  OVERRIDE_TARGET_MISSING: 'error',
};

export const finalStatusExplanations: Record<
  AcgihRiskCorrelationFinalStatus,
  string
> = {
  MATCH_REUSED_NR7:
    'Correlação automática: CAS bate com indicador NR-7 que já possui um único Fator de Risco vinculado (reusa o vínculo NR-7).',
  MATCH_CAS_EXACT:
    'Correlação automática: CAS bate exatamente com um único Fator de Risco do sistema.',
  MATCH_CAS_IN_GROUP:
    'Correlação automática: CAS encontrado dentro de um fator amplo/grupo (múltiplos CAS).',
  MATCH_NAME:
    'Correlação automática: nome ou sinônimo bate com um único Fator de Risco.',
  AMBIGUOUS:
    'Correlação automática ambígua: CAS/nome bate com mais de um Fator de Risco; exige decisão manual.',
  NO_MATCH:
    'Correlação automática não encontrou Fator de Risco correspondente; exige decisão manual.',
  ALREADY_LINKED:
    'Indicador oficial promovido que já possui vínculo de risco no banco atual.',
  ACEITAR_CANONICO:
    'Decisão manual: aceitar um Fator de Risco canônico único (resolve duplicidade/erro cadastral).',
  ACEITAR_GRUPO:
    'Decisão manual: aceitar fator amplo/família (não é CAS exato).',
  ACEITAR_MULTIPLO_CANONICO:
    'Decisão manual: vincular a mais de um Fator de Risco (ex.: TDI isômeros 2,4 e 2,6).',
  OVERRIDE_TARGET_MISSING:
    'Override manual cujo Fator de Risco alvo não existe, não é system=true ou está deletado no banco atual.',
};

export const decisionSourceLabels: Record<
  AcgihRiskCorrelationDecisionSource,
  string
> = {
  AUTO: 'Automático',
  MANUAL_OVERRIDE: 'Override manual',
};

export const decisionSourceColors: Record<
  AcgihRiskCorrelationDecisionSource,
  ChipColor
> = {
  AUTO: 'default',
  MANUAL_OVERRIDE: 'info',
};

export const cardinalityLabels: Record<
  AcgihRiskCorrelationCardinality,
  string
> = {
  SINGLE: 'Único',
  MULTIPLE: 'Múltiplo',
  NONE: 'Nenhum',
};

export const cardinalityColors: Record<
  AcgihRiskCorrelationCardinality,
  ChipColor
> = {
  SINGLE: 'default',
  MULTIPLE: 'info',
  NONE: 'warning',
};

export const matchMethodLabels: Record<string, string> = {
  CAS_VIA_NR7_LINK: 'CAS via vínculo NR-7',
  CAS_EXACT: 'CAS exato',
  CAS_IN_GROUP: 'CAS em grupo',
  NAME_EXACT: 'Nome exato',
  SYNONYM_EXACT: 'Sinônimo exato',
  ALREADY_LINKED: 'Já vinculado',
  MANUAL_OVERRIDE: 'Override manual',
};

export const confidenceLabels: Record<string, string> = {
  HIGH: 'Alta',
  PROBABLE: 'Provável',
  LOW: 'Baixa',
  MANUAL: 'Manual',
};

export const formatMatchMethod = (
  method: AcgihRiskCorrelationMatchMethod,
): string => (method ? (matchMethodLabels[method] ?? method) : '—');

export const formatConfidence = (
  confidence: AcgihRiskCorrelationConfidence,
): string => (confidence ? (confidenceLabels[confidence] ?? confidence) : '—');

/** Tooltips obrigatórios da central de consolidação ACGIH/BEI. */
export const promotionTooltips = {
  promoted:
    'Indicador ACGIH/BEI já foi criado como indicador oficial do sistema.',
  notPromoted: 'Indicador ACGIH/BEI ainda não foi promovido a indicador oficial.',
  alreadyLinkedRisk: (names: string[]) =>
    names.length
      ? `Vinculado ao(s) fator(es) de risco: ${names.join(', ')}.`
      : 'Já possui vínculo com fator(es) de risco.',
} as const;

export const decisionSourceTooltips: Record<
  AcgihRiskCorrelationDecisionSource,
  string
> = {
  AUTO:
    'Correlação calculada automaticamente pelo sistema, por reuso NR-7, CAS, nome/sinônimo ou regra de grupo.',
  MANUAL_OVERRIDE:
    'Correlação definida manualmente durante a curadoria ACGIH/BEI.',
};

export const cardinalityTooltips: Record<
  AcgihRiskCorrelationCardinality,
  string
> = {
  SINGLE: 'Este indicador está vinculado a um único fator de risco.',
  MULTIPLE:
    'Este indicador está vinculado a mais de um fator de risco, como o caso TDI 2,4 e 2,6.',
  NONE: 'Nenhum fator de risco vinculado ou proposto.',
};

export const examLinkStatusLabels: Record<AcgihExamPreviewStatus, string> = {
  LINKED: 'Confirmado',
  LINKED_PENDING_CONFIRMATION: 'Pendente confirmação',
  NOT_LINKED: 'Não vinculado',
  AMBIGUOUS: 'Ambíguo',
  NO_MATCH: 'Sem sugestão',
  READY_TO_CREATE: 'A criar',
};

export const examLinkStatusColors: Record<AcgihExamPreviewStatus, ChipColor> = {
  LINKED: 'success',
  LINKED_PENDING_CONFIRMATION: 'warning',
  NOT_LINKED: 'error',
  AMBIGUOUS: 'warning',
  NO_MATCH: 'error',
  READY_TO_CREATE: 'info',
};

export const examLinkStatusTooltips: Record<AcgihExamPreviewStatus, string> = {
  LINKED:
    'Exame do sistema vinculado e confirmado — elegível para sync da Biblioteca.',
  LINKED_PENDING_CONFIRMATION:
    'Há vínculo de exame, mas ainda não confirmado. Confirme antes do sync da Biblioteca.',
  NOT_LINKED:
    'Este indicador ACGIH/BEI ainda não possui exame do sistema vinculado.',
  AMBIGUOUS: 'Múltiplos exames candidatos — escolha manual necessária.',
  NO_MATCH: 'Dados insuficientes para sugerir exame.',
  READY_TO_CREATE:
    'Não há exame correspondente no catálogo; pode ser criado exame sistêmico.',
};

export const formatExamSuggestion = (examLink?: IAcgihExamPreviewLink): string => {
  if (!examLink) return '—';
  switch (examLink.status) {
    case 'NOT_LINKED':
      return examLink.examName
        ? `Vincular: ${examLink.examName}`
        : 'Vincular exame';
    case 'READY_TO_CREATE':
      return examLink.suggestedExamName
        ? `Criar exame: ${examLink.suggestedExamName}`
        : 'Criar exame';
    case 'AMBIGUOUS':
      return 'Ambíguo';
    case 'LINKED':
      return examLink.examName ?? 'Confirmado';
    case 'LINKED_PENDING_CONFIRMATION':
      return examLink.examName
        ? `Pendente: ${examLink.examName}`
        : 'Pendente confirmação';
    case 'NO_MATCH':
      return 'Sem sugestão';
    default:
      return '—';
  }
};
