import { FormAiAnalysisStatusEnum } from '@v2/models/form/models/form-questions-answers-analysis/form-questions-answers-analysis-browse-result.model';

export const FORM_AI_ANALYSIS_PROCESSING_FRESHNESS_MS = 60 * 60 * 1000;

export const DEFAULT_STUCK_AI_ANALYSIS_OLDER_THAN_MINUTES = 60;

type ProcessingAnalysisLike = {
  status: FormAiAnalysisStatusEnum | string;
  updatedAt?: Date | string;
  createdAt?: Date | string;
};

function getProcessingReferenceDate(
  analysis: ProcessingAnalysisLike,
): Date | null {
  const raw = analysis.updatedAt ?? analysis.createdAt;
  if (!raw) return null;

  const date = raw instanceof Date ? raw : new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function isRecentlyProcessingAnalysis(
  analysis: ProcessingAnalysisLike,
): boolean {
  if (analysis.status !== FormAiAnalysisStatusEnum.PROCESSING) return false;

  const referenceDate = getProcessingReferenceDate(analysis);
  if (!referenceDate) return false;

  return (
    Date.now() - referenceDate.getTime() <
    FORM_AI_ANALYSIS_PROCESSING_FRESHNESS_MS
  );
}

export function isStaleProcessingAnalysis(
  analysis: ProcessingAnalysisLike,
  olderThanMinutes: number = DEFAULT_STUCK_AI_ANALYSIS_OLDER_THAN_MINUTES,
): boolean {
  if (analysis.status !== FormAiAnalysisStatusEnum.PROCESSING) return false;

  const referenceDate = getProcessingReferenceDate(analysis);
  if (!referenceDate) return false;

  return (
    Date.now() - referenceDate.getTime() >= olderThanMinutes * 60 * 1000
  );
}

export const hasRecentProcessingAnalyses = (
  analyses: ProcessingAnalysisLike[] | undefined,
): boolean => {
  if (!analyses) return false;
  return analyses.some((analysis) => isRecentlyProcessingAnalysis(analysis));
};

export const hasStaleProcessingAnalyses = (
  analyses: ProcessingAnalysisLike[] | undefined,
  olderThanMinutes: number = DEFAULT_STUCK_AI_ANALYSIS_OLDER_THAN_MINUTES,
): boolean => {
  if (!analyses) return false;
  return analyses.some((analysis) =>
    isStaleProcessingAnalysis(analysis, olderThanMinutes),
  );
};
