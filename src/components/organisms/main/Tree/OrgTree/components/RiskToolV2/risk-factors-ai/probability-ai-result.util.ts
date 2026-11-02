import type { ExistingRiskReview } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import {
  buildModularSuggestionKey,
  getSuggestionValues,
} from 'components/organisms/modals/ModalAddCharacterization/components/ModalAiAnalysisContent/ai-risk-field-suggestion.util';

export type ProbabilityAiResult =
  | 'pending'
  | 'unchanged'
  | 'unavailable'
  | 'applied'
  | 'dismissed'
  | 'ineligible';

export const PROBABILITY_AI_GUIDANCE =
  'A sugestão da IA é uma estimativa técnica orientativa com base nas informações disponíveis. Ela não substitui o cálculo por critérios do modal Estimar Probabilidade e não preenche seus parâmetros.';

export const PROBABILITY_AI_MESSAGES: Record<
  Exclude<ProbabilityAiResult, 'pending'>,
  string
> = {
  unchanged:
    'A IA não propôs alteração em relação à probabilidade atualmente registrada. Isso não representa validação técnica da classificação existente.',
  unavailable:
    'Não foi possível obter uma sugestão de probabilidade válida nesta análise.',
  applied:
    'A sugestão de probabilidade retornada nesta análise já foi aplicada nesta sessão. Nenhuma nova pendência foi criada.',
  dismissed:
    'A sugestão de probabilidade retornada nesta análise já foi descartada nesta sessão. Ela não será reapresentada como pendência.',
  ineligible:
    'Esta ocorrência não está disponível para análise ou aprovação de probabilidade por IA. Os bloqueios existentes foram preservados.',
};

const probabilityValue = (value: unknown): number | undefined => {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined;
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 5
    ? number
    : undefined;
};

/** Usa apenas resultados já vinculados à ocorrência; não interpreta o texto bruto da IA. */
export function resolveProbabilityAiResult(params: {
  eligible: boolean;
  pendingCount: number;
  riskId: string;
  riskFactorDataId?: string;
  currentProbability?: number | null;
  metadata?: unknown;
  reviews: ExistingRiskReview[];
  appliedKeys: ReadonlySet<string>;
  dismissedKeys: ReadonlySet<string>;
}): ProbabilityAiResult {
  const metadata = params.metadata as
    | { status?: unknown; value?: unknown }
    | undefined;
  if (!params.eligible || metadata?.status === 'ineligible')
    return 'ineligible';
  const values = params.reviews
    .filter(
      (review) =>
        review.riskId === params.riskId &&
        review.riskFactorDataId === params.riskFactorDataId,
    )
    .flatMap((review) =>
      review.suggestions.filter((item) => item.field === 'probability'),
    )
    .flatMap(getSuggestionValues)
    .map(probabilityValue)
    .filter((value): value is number => value !== undefined);
  if (metadata?.status === 'suggested' || metadata?.status === 'unchanged') {
    const value = probabilityValue(metadata.value);
    if (value !== undefined) values.push(value);
  }
  for (const value of values) {
    const key = buildModularSuggestionKey(
      params.riskId,
      'probability',
      String(value),
    );
    if (params.appliedKeys.has(key)) return 'applied';
    if (params.dismissedKeys.has(key)) return 'dismissed';
  }
  if (values.some((value) => value === params.currentProbability))
    return 'unchanged';
  if (values.length && params.pendingCount > 0) return 'pending';
  return 'unavailable';
}

/** Reconhece rejeições do validador existente, sem tratar erros da IA como inelegibilidade. */
export function isProbabilityOccurrenceRejection(error: unknown): boolean {
  const response = (
    error as { response?: { status?: number; data?: { code?: string } } }
  )?.response;
  return (
    (response?.status === 422 &&
      [
        'INVALID_IDENTITY',
        'COMPANY_UNAVAILABLE',
        'WORKSPACE_UNAVAILABLE',
        'RISK_GROUP_UNAVAILABLE',
        'OCCURRENCE_NOT_FOUND',
        'IDENTITY_MISMATCH',
        'HISTORICAL_OCCURRENCE',
        'FUTURE_OCCURRENCE',
        'OWNER_UNAVAILABLE',
        'WORKSPACE_NOT_LINKED',
        'OWNER_TYPE_MISMATCH',
        'INHERITED_OCCURRENCE',
        'AMBIGUOUS_OCCURRENCE',
      ].includes(response.data?.code || '')) ||
    (response?.status === 403 &&
      ['COMPANY_NOT_AUTHORIZED', 'EDIT_NOT_AUTHORIZED'].includes(
        response.data?.code || '',
      ))
  );
}
