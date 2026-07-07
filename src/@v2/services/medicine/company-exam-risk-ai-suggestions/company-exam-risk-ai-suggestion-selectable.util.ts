import type { ICompanyExamRiskAiSuggestionItem } from './company-exam-risk-ai-suggestions.types';

export const isCompanyExamRiskAiSuggestionSelectable = (
  item: ICompanyExamRiskAiSuggestionItem,
): boolean => {
  if (item.existingCompanyLink) return false;
  if (item.candidateCompatibility === 'LOW_RELEVANCE') return false;
  if (item.decision !== 'suggest') return false;
  if (item.analysisStatus !== 'AI_ANALYZED') return false;
  return true;
};
