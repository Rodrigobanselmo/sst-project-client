import { useQuery } from 'react-query';

import {
  fetchExamTechnicalSuggestion,
  IExamTechnicalSuggestion,
} from '@v2/services/medicine/exam-technical-suggestion/exam-technical-suggestion.service';

export function useQueryExamTechnicalSuggestion(params: {
  companyId?: string;
  riskFactorId?: string;
  examId?: number;
  enabled?: boolean;
}) {
  const enabled =
    Boolean(params.enabled) &&
    Boolean(params.companyId) &&
    Boolean(params.riskFactorId) &&
    Boolean(params.examId);

  return useQuery<IExamTechnicalSuggestion>(
    [
      'exam-technical-suggestion',
      params.companyId,
      params.riskFactorId,
      params.examId,
    ],
    () =>
      fetchExamTechnicalSuggestion({
        companyId: params.companyId!,
        riskFactorId: params.riskFactorId!,
        examId: params.examId!,
      }),
    {
      enabled,
      staleTime: 60_000,
      retry: false,
    },
  );
}
