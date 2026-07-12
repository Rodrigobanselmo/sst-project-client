import { RecTypeEnum } from 'project/enum/recType.enum';
import { StatusEnum } from 'project/enum/status.enum';

/** Pesos da hierarquia de controles (NR-01 / hierarquia clássica). */
export const CONTROL_TYPE_WEIGHTS: Record<RecTypeEnum, number> = {
  [RecTypeEnum.ENG]: 1.25,
  [RecTypeEnum.ADM]: 0.5,
  [RecTypeEnum.EPI]: 0.25,
};

export type ResidualControlRecommendation = {
  recType?: RecTypeEnum | string | null;
  status?: StatusEnum | string | null;
};

const isValidRealProbability = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isFinite(value) &&
  value >= 1 &&
  value <= 6;

const isActiveRecommendation = (
  recommendation: ResidualControlRecommendation,
): boolean => {
  const status = recommendation.status;
  if (status == null || status === '') return true;
  return status !== StatusEnum.INACTIVE && status !== StatusEnum.CANCELED;
};

const resolveControlWeight = (
  recType: ResidualControlRecommendation['recType'],
): number => {
  if (!recType) return 0;
  if (recType === RecTypeEnum.ENG || recType === 'ENG') {
    return CONTROL_TYPE_WEIGHTS[RecTypeEnum.ENG];
  }
  if (recType === RecTypeEnum.ADM || recType === 'ADM') {
    return CONTROL_TYPE_WEIGHTS[RecTypeEnum.ADM];
  }
  if (recType === RecTypeEnum.EPI || recType === 'EPI') {
    return CONTROL_TYPE_WEIGHTS[RecTypeEnum.EPI];
  }
  return 0;
};

/** Residual vazio no RiskTool: null/undefined/0 (UI trata 0 como sem valor). */
export const isResidualProbabilityEmpty = (
  value: number | null | undefined,
): boolean => value == null || value === 0;

/**
 * Soma ponderada dos tipos de medida ativos vinculados ao risco.
 * Tipos ausentes/inválidos contam peso 0. Inativos/cancelados são ignorados.
 */
export const calculateControlMeasuresWeight = (
  recommendations: ResidualControlRecommendation[] | null | undefined,
): number => {
  if (!recommendations?.length) return 0;

  return recommendations.reduce((total, recommendation) => {
    if (!isActiveRecommendation(recommendation)) return total;
    return total + resolveControlWeight(recommendation.recType);
  }, 0);
};

/**
 * Sugestão de probabilidade residual pela hierarquia de controles.
 *
 * reducao = Math.floor(pesoTotal)
 * sugerida = max(1, probabilidadeReal - reducao)
 *
 * Retorna `undefined` quando não há probabilidade real válida ou quando
 * não há recomendações ativas (regra atual: residual só faz sentido com recs).
 */
export const calculateSuggestedResidualProbability = (
  realProbability: number | null | undefined,
  recommendations: ResidualControlRecommendation[] | null | undefined,
): number | undefined => {
  if (!isValidRealProbability(realProbability)) return undefined;

  const activeRecommendations = (recommendations ?? []).filter(
    isActiveRecommendation,
  );
  if (!activeRecommendations.length) return undefined;

  const pesoTotal = calculateControlMeasuresWeight(activeRecommendations);
  const reducaoProbabilidade = Math.floor(pesoTotal);

  return Math.max(1, realProbability - reducaoProbabilidade);
};

/**
 * Auto-aplica se residual estiver vazio ou se o valor atual ainda segue a
 * sugestão anterior (usuário não customizou manualmente).
 */
export const shouldAutoApplySuggestedResidual = (
  currentResidual: number | null | undefined,
  previousSuggested: number | null | undefined,
): boolean => {
  if (isResidualProbabilityEmpty(currentResidual)) return true;
  if (
    previousSuggested != null &&
    currentResidual === previousSuggested
  ) {
    return true;
  }
  return false;
};

/**
 * Resolve o `probabilityAfter` a persistir após adicionar/remover recomendações.
 * - Sem recs restantes → `0` (preserva limpeza atual do RiskTool)
 * - Auto-aplicável → nova sugestão (ou `0` se não houver real válida)
 * - Manual → `undefined` (não sobrescrever; omitir no payload)
 */
export const resolveResidualProbabilityAfterRecChange = (params: {
  realProbability: number | null | undefined;
  currentResidual: number | null | undefined;
  previousRecommendations: ResidualControlRecommendation[] | null | undefined;
  nextRecommendations: ResidualControlRecommendation[] | null | undefined;
}): number | undefined => {
  const {
    realProbability,
    currentResidual,
    previousRecommendations,
    nextRecommendations,
  } = params;

  const nextActive = (nextRecommendations ?? []).filter(isActiveRecommendation);
  if (!nextActive.length) return 0;

  const previousSuggested = calculateSuggestedResidualProbability(
    realProbability,
    previousRecommendations,
  );
  if (!shouldAutoApplySuggestedResidual(currentResidual, previousSuggested)) {
    return undefined;
  }

  return (
    calculateSuggestedResidualProbability(realProbability, nextActive) ?? 0
  );
};
