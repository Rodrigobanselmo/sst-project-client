export const CompanyExamRiskAiSuggestionsRoutes = {
  DRY_RUN: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-ai-suggestions/dry-run`,
  APPLY: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-ai-suggestions/apply`,
} as const;
