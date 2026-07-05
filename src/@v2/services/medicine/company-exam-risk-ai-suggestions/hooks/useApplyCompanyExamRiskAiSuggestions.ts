import { useMutation } from 'react-query';

import { applyCompanyExamRiskAiSuggestions } from '../company-exam-risk-ai-suggestions.service';
import type { IApplyCompanyExamRiskAiSuggestionsParams } from '../company-exam-risk-ai-suggestions.types';

export const useApplyCompanyExamRiskAiSuggestions = () =>
  useMutation((params: IApplyCompanyExamRiskAiSuggestionsParams) =>
    applyCompanyExamRiskAiSuggestions(params),
  );
