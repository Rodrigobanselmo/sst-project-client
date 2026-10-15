import type {
  AiRiskFieldSuggestionField,
  ExistingRiskReview,
} from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { IRiskData } from 'core/interfaces/api/IRiskData';
import { RecTypeEnum } from 'project/enum/recType.enum';
import { normalizeSuggestionText } from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';

export type RiskFactorAiField = Exclude<
  AiRiskFieldSuggestionField,
  'probability' | 'observation'
>;

export type RiskFactorAiApiField =
  | 'fonteGeradora'
  | 'medidasEngenhariaExistentes'
  | 'medidasAdministrativasExistentes'
  | 'medidasEngenhariaRecomendadas'
  | 'medidasAdministrativasRecomendadas';

export const RISK_FACTOR_AI_API_FIELD: Record<RiskFactorAiField, RiskFactorAiApiField> = {
  generateSource: 'fonteGeradora',
  existingEngineeringMeasures: 'medidasEngenhariaExistentes',
  existingAdministrativeMeasures: 'medidasAdministrativasExistentes',
  recommendedEngineeringMeasures: 'medidasEngenhariaRecomendadas',
  recommendedAdministrativeMeasures: 'medidasAdministrativasRecomendadas',
};

const RISK_MODE_FIELDS = new Set<RiskFactorAiField>(
  Object.keys(RISK_FACTOR_AI_API_FIELD) as RiskFactorAiField[],
);

export type RiskFactorAiScopeRequest =
  | { scope: 'risk'; riskId: string }
  | { scope: 'field'; riskId: string; field: RiskFactorAiField };

export function buildAiAnalyzeScopePayload(request: RiskFactorAiScopeRequest): {
  scope: 'risk' | 'field';
  riskId: string;
  field?: RiskFactorAiApiField;
} {
  if (request.scope === 'risk') {
    return { scope: 'risk', riskId: request.riskId };
  }
  return {
    scope: 'field',
    riskId: request.riskId,
    field: RISK_FACTOR_AI_API_FIELD[request.field],
  };
}

export function scopedAiEmptyMessage(scope: RiskFactorAiScopeRequest['scope']): string {
  if (scope === 'risk') {
    return 'Não foram identificadas sugestões pertinentes para este fator de risco.';
  }
  return 'Não foram identificadas sugestões pertinentes para este campo.';
}

export function existingControlEmptyMessage(
  reason?: 'missing_generate_source' | 'insufficient_context' | 'exhausted' | null,
): string {
  if (reason === 'missing_generate_source') {
    return 'Preencha a fonte geradora deste fator antes de pedir sugestões de controles existentes.';
  }
  if (reason === 'insufficient_context') {
    return 'Não há contexto suficiente para sugerir um controle existente. Complete a descrição, as atividades ou os cargos e detalhe a fonte geradora.';
  }
  if (reason === 'exhausted') {
    return 'Não há outras alternativas defensáveis além das medidas e sugestões já consideradas para este campo.';
  }
  return scopedAiEmptyMessage('field');
}

export function filterReviewsForRiskFactorAi(
  reviews: ExistingRiskReview[],
  request: RiskFactorAiScopeRequest,
): ExistingRiskReview[] {
  return reviews
    .filter((review) => review.riskId === request.riskId)
    .map((review) => ({
      ...review,
      suggestions: (review.suggestions || []).filter((suggestion) => {
        if (suggestion.field === 'probability' || suggestion.field === 'observation') {
          return false;
        }
        if (request.scope === 'field') return suggestion.field === request.field;
        return RISK_MODE_FIELDS.has(suggestion.field);
      }),
    }))
    .filter((review) => review.suggestions.length > 0);
}

function sameSuggestionText(value: string | number, candidate?: string | null) {
  const normalized = normalizeSuggestionText(String(value));
  if (!normalized) return false;
  return normalizeSuggestionText(candidate || '') === normalized;
}

/** True when the live risk record already has this text in the same concept. */
export function riskDataAlreadyContainsFieldValue(
  field: RiskFactorAiField | 'probability',
  value: string | number,
  riskData: Pick<
    IRiskData,
    'generateSources' | 'engs' | 'adms' | 'recs' | 'probability'
  >,
): boolean {
  switch (field) {
    case 'probability': {
      const expected = Number(value);
      return (
        Number.isFinite(expected) &&
        typeof riskData.probability === 'number' &&
        riskData.probability === expected
      );
    }
    case 'generateSource':
      return (riskData.generateSources || []).some((item) =>
        sameSuggestionText(value, item?.name),
      );
    case 'existingEngineeringMeasures':
      return (riskData.engs || []).some((item) =>
        sameSuggestionText(value, item?.medName || item?.recName),
      );
    case 'existingAdministrativeMeasures':
      return (riskData.adms || []).some((item) =>
        sameSuggestionText(value, item?.medName || item?.recName),
      );
    case 'recommendedEngineeringMeasures':
      return (riskData.recs || []).some(
        (item) =>
          sameSuggestionText(value, item?.recName || item?.medName) &&
          (!item?.recType || item.recType === RecTypeEnum.ENG),
      );
    case 'recommendedAdministrativeMeasures':
      return (riskData.recs || []).some(
        (item) =>
          sameSuggestionText(value, item?.recName || item?.medName) &&
          (!item?.recType || item.recType === RecTypeEnum.ADM),
      );
  }
}
