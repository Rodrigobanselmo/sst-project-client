import { CompanyExamRiskAiSuggestionsRoutes } from '@v2/constants/routes/company-exam-risk-ai-suggestions.routes';
import { api } from 'core/services/apiClient';

import type {
  IApplyCompanyExamRiskAiSuggestionsParams,
  IApplyCompanyExamRiskAiSuggestionsResponse,
  IDryRunCompanyExamRiskAiSuggestionsParams,
  IDryRunCompanyExamRiskAiSuggestionsResponse,
  IGenerateCompanyExamRiskAiPromptDraftParams,
  IGenerateCompanyExamRiskAiPromptDraftResponse,
} from './company-exam-risk-ai-suggestions.types';

export async function generateCompanyExamRiskAiPromptDraft(
  params: IGenerateCompanyExamRiskAiPromptDraftParams,
): Promise<IGenerateCompanyExamRiskAiPromptDraftResponse> {
  const { companyId, ...body } = params;
  const response = await api.post<IGenerateCompanyExamRiskAiPromptDraftResponse>(
    CompanyExamRiskAiSuggestionsRoutes.PROMPT_DRAFT(companyId),
    body,
  );
  return response.data;
}

export async function dryRunCompanyExamRiskAiSuggestions(
  params: IDryRunCompanyExamRiskAiSuggestionsParams,
): Promise<IDryRunCompanyExamRiskAiSuggestionsResponse> {
  const { companyId, ...body } = params;
  const response = await api.post<IDryRunCompanyExamRiskAiSuggestionsResponse>(
    CompanyExamRiskAiSuggestionsRoutes.DRY_RUN(companyId),
    body,
  );
  return response.data;
}

export async function applyCompanyExamRiskAiSuggestions(
  params: IApplyCompanyExamRiskAiSuggestionsParams,
): Promise<IApplyCompanyExamRiskAiSuggestionsResponse> {
  const { companyId, ...body } = params;
  const response = await api.post<IApplyCompanyExamRiskAiSuggestionsResponse>(
    CompanyExamRiskAiSuggestionsRoutes.APPLY(companyId),
    body,
  );
  return response.data;
}
