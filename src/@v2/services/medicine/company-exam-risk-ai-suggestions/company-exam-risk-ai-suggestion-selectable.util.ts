import type { ICompanyExamRiskAiSuggestionItem } from './company-exam-risk-ai-suggestions.types';

/**
 * Physician may select any exam with an interpretable AI analysis.
 * Structural failures remain blocked. AI opinion never blocks inclusion.
 */
export const isCompanyExamRiskAiSuggestionSelectable = (
  item: ICompanyExamRiskAiSuggestionItem,
): boolean => {
  if (item.existingCompanyLink) return false;
  if (item.candidateCompatibility === 'LOW_RELEVANCE') return false;
  if (item.isSelectable === false) return false;
  if (item.analysisStatus !== 'AI_ANALYZED') return false;
  if (item.analysisVerdict === 'MANUAL_REVIEW_REQUIRED') return false;
  return true;
};

/** Only unconditional ADD (decision suggest) is auto-checked. */
export const isCompanyExamRiskAiSuggestionAutoSelected = (
  item: ICompanyExamRiskAiSuggestionItem,
): boolean => {
  if (!isCompanyExamRiskAiSuggestionSelectable(item)) return false;
  if (item.isAutoSelected === true) return true;
  if (item.analysisVerdict === 'ADD') return true;
  return item.decision === 'suggest';
};

export const requiresPhysicianOverrideConfirmation = (
  item: ICompanyExamRiskAiSuggestionItem,
): boolean => {
  if (!isCompanyExamRiskAiSuggestionSelectable(item)) return false;
  return !isCompanyExamRiskAiSuggestionAutoSelected(item);
};
