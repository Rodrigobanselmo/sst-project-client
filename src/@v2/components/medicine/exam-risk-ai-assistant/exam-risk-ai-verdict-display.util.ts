import {
  EXAM_RISK_AI_ADOPTION_STATUS_LABELS,
  EXAM_RISK_AI_ANALYSIS_STATUS_LABELS,
  EXAM_RISK_AI_PROTOCOL_ROLE_LABELS,
  EXAM_RISK_AI_PURPOSE_LABELS,
  EXAM_RISK_AI_RECOMMENDED_DECISION_STATUS_LABELS,
  EXAM_RISK_AI_VERDICT_LABELS,
  EXAM_RISK_AI_VERDICT_RECOMMENDATION_PHRASES,
} from './exam-risk-ai-assistant.constants';

const lookup = <T extends Record<string, string>>(
  map: T,
  value: string | undefined | null,
): string | undefined => {
  if (!value) return undefined;
  return map[value as keyof T];
};

export const getExamRiskAiVerdictLabel = (
  verdict?: string | null,
): string =>
  lookup(EXAM_RISK_AI_VERDICT_LABELS, verdict) ??
  'Recomendação técnica disponível';

export const getExamRiskAiVerdictRecommendationPhrase = (
  verdict?: string | null,
): string =>
  lookup(EXAM_RISK_AI_VERDICT_RECOMMENDATION_PHRASES, verdict) ??
  'avaliar tecnicamente';

export const getExamRiskAiAnalysisStatusLabel = (
  status?: string | null,
): string =>
  lookup(EXAM_RISK_AI_ANALYSIS_STATUS_LABELS, status) ??
  (status ? 'Status técnico indisponível' : '—');

export const getExamRiskAiAdoptionStatusLabel = (
  status?: string | null,
): string =>
  lookup(EXAM_RISK_AI_ADOPTION_STATUS_LABELS, status) ?? status ?? '—';

export const getExamRiskAiPurposeLabel = (
  purpose?: string | null,
): string =>
  lookup(EXAM_RISK_AI_PURPOSE_LABELS, purpose) ?? purpose ?? '—';

export const getExamRiskAiRecommendedDecisionStatusLabel = (
  status?: string | null,
): string =>
  lookup(EXAM_RISK_AI_RECOMMENDED_DECISION_STATUS_LABELS, status) ??
  status ??
  '—';

export const getExamRiskAiProtocolRoleLabel = (
  role?: string | null,
): string =>
  lookup(EXAM_RISK_AI_PROTOCOL_ROLE_LABELS, role) ?? role ?? '—';

export type PhysicianOverrideConfirmationCopy = {
  headline: string;
  lead: string;
  body: string;
};

/**
 * Human-readable confirmation copy when the physician overrides a non-ADD
 * recommendation. Never surfaces raw enums.
 */
export const buildPhysicianOverrideConfirmationCopy = (params: {
  examName: string;
  analysisVerdict?: string | null;
}): PhysicianOverrideConfirmationCopy => {
  const { examName } = params;
  const verdict = params.analysisVerdict ?? '';
  const phrase = getExamRiskAiVerdictRecommendationPhrase(verdict);
  const headline = `${examName} · recomendação da IA: ${phrase}`;
  const lead =
    'A IA não recomendou a inclusão automática deste exame.';

  switch (verdict) {
    case 'ADD_CONDITIONALLY':
      return {
        headline,
        lead,
        body: `A ${examName} foi classificada como uma recomendação condicional. Você poderá incluí-la manualmente caso exista justificativa técnica ou a condição necessária seja confirmada. Deseja prosseguir?`,
      };
    case 'KEEP_CONDITIONALLY':
      return {
        headline,
        lead,
        body: `A ${examName} foi classificada como manutenção condicional. Você poderá incluí-la manualmente caso exista justificativa técnica ou a condição necessária seja confirmada. Deseja prosseguir?`,
      };
    case 'DO_NOT_APPLY_IN_CONTEXT':
      return {
        headline,
        lead,
        body: `A IA recomenda não aplicar ${examName} neste contexto. Você poderá incluí-la manualmente caso exista justificativa técnica. Deseja prosseguir?`,
      };
    case 'INSUFFICIENT_CONTEXT':
      return {
        headline,
        lead,
        body: `A IA considerou as informações insuficientes para concluir sobre ${examName}. Você poderá incluí-la manualmente com critério clínico. Deseja prosseguir?`,
      };
    case 'KEEP':
    case 'KEEP_LOCAL_JUSTIFIED':
      return {
        headline,
        lead,
        body: `A IA recomenda manter ${examName} no cenário atual (sem inclusão automática de novo vínculo). Você poderá incluí-la manualmente se fizer sentido tecnicamente. Deseja prosseguir?`,
      };
    case 'REVIEW_OFFICIAL_RULE':
      return {
        headline,
        lead,
        body: `A IA sugere revisar o padrão oficial relacionado a ${examName}. Você poderá incluí-la manualmente caso exista justificativa técnica. Deseja prosseguir?`,
      };
    default:
      return {
        headline,
        lead,
        body: `Você poderá incluir ${examName} manualmente caso exista justificativa técnica. Deseja prosseguir?`,
      };
  }
};
