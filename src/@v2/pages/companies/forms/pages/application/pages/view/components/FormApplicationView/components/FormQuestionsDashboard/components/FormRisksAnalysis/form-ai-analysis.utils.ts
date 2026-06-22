import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export const FORM_AI_ANALYSIS_BATCH_FRESHNESS_MS = 15 * 60 * 1000;

/** Alinhado à API: MIN_OCCUPATIONAL_RISK_LEVEL = 3 (Moderado ou superior). */
export const MIN_OCCUPATIONAL_RISK_LEVEL_FOR_AI_ANALYSIS = 3;

export function isOccupationalRiskEligibleForAiAnalysis(
  matriz: { level: number } | null | undefined,
): boolean {
  return (
    matriz != null &&
    matriz.level >= MIN_OCCUPATIONAL_RISK_LEVEL_FOR_AI_ANALYSIS
  );
}

export const isRecentFormAiAnalysis = (updatedAt?: Date | string | null): boolean => {
  if (!updatedAt) return false;
  return new Date(updatedAt).getTime() > Date.now() - FORM_AI_ANALYSIS_BATCH_FRESHNESS_MS;
};

export const getFormAiAnalysisErrorMessage = (
  metadata?: Record<string, unknown>,
): string => {
  const error = metadata?.error;
  if (typeof error !== 'string' || !error.trim()) {
    return 'A análise de IA falhou. Tente novamente.';
  }

  if (error.includes('429') || error.toLowerCase().includes('quota')) {
    return 'A análise de IA falhou: cota da API de IA excedida no ambiente. Verifique chave/billing da OpenAI.';
  }

  return error.length > 220 ? `${error.slice(0, 220)}...` : error;
};

type AnalysisResult = {
  status: FormAiAnalysisStatusEnum;
  analysis?: unknown | null;
  metadata?: Record<string, unknown>;
  updatedAt?: Date | string;
};

export const getRecentFormAiAnalysisBatchSummary = (
  results: AnalysisResult[] | undefined,
) => {
  const recent = (results ?? []).filter((item) => isRecentFormAiAnalysis(item.updatedAt));
  const done = recent.filter(
    (item) => item.status === FormAiAnalysisStatusEnum.DONE && item.analysis,
  );
  const failed = recent.filter((item) => item.status === FormAiAnalysisStatusEnum.FAILED);
  const processing = recent.filter(
    (item) => item.status === FormAiAnalysisStatusEnum.PROCESSING,
  );

  return { recent, done, failed, processing };
};
