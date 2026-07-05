export const CompanyExamRiskSuggestionsRoutes = {
  APPLY: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-suggestions/apply`,
} as const;
