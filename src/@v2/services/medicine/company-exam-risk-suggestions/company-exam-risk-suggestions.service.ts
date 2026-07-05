import { CompanyExamRiskSuggestionsRoutes } from '@v2/constants/routes/company-exam-risk-suggestions.routes';
import { api } from 'core/services/apiClient';

import type {
  IApplyExamRiskSuggestionsParams,
  IApplyExamRiskSuggestionsResponse,
} from './company-exam-risk-suggestions.types';

export async function applyExamRiskSuggestions(
  params: IApplyExamRiskSuggestionsParams,
): Promise<IApplyExamRiskSuggestionsResponse> {
  const { companyId, ...body } = params;
  const response = await api.post<IApplyExamRiskSuggestionsResponse>(
    CompanyExamRiskSuggestionsRoutes.APPLY(companyId),
    body,
  );
  return response.data;
}
