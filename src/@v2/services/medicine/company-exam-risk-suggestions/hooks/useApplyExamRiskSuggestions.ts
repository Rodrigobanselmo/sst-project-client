import { useMutation } from 'react-query';

import { applyExamRiskSuggestions } from '../company-exam-risk-suggestions.service';
import type { IApplyExamRiskSuggestionsParams } from '../company-exam-risk-suggestions.types';

export const useApplyExamRiskSuggestions = () =>
  useMutation((params: IApplyExamRiskSuggestionsParams) =>
    applyExamRiskSuggestions(params),
  );
