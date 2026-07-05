import { useMutation } from 'react-query';

import { dryRunCompanyExamRiskAiSuggestions } from '../company-exam-risk-ai-suggestions.service';
import type { IDryRunCompanyExamRiskAiSuggestionsParams } from '../company-exam-risk-ai-suggestions.types';

export const useDryRunCompanyExamRiskAiSuggestions = () =>
  useMutation((params: IDryRunCompanyExamRiskAiSuggestionsParams) =>
    dryRunCompanyExamRiskAiSuggestions(params),
  );
