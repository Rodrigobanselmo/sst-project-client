import type {
  AcgihRiskCorrelationCardinality,
  AcgihRiskCorrelationConfidence,
  AcgihRiskCorrelationDecisionSource,
  AcgihRiskCorrelationFinalStatus,
  AcgihRiskCorrelationMatchMethod,
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
  ALREADY_LINKED: 'primary',
  ACEITAR_CANONICO: 'success',
  ACEITAR_GRUPO: 'info',
  ACEITAR_MULTIPLO_CANONICO: 'primary',
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
  MANUAL_OVERRIDE: 'primary',
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
  MULTIPLE: 'primary',
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
