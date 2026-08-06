export const CompanyExamRiskAiSuggestionsRoutes = {
  PROMPT_GUIDANCE_DEFAULT: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-ai-suggestions/prompt-guidance-default`,
  PROMPT_DRAFT: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-ai-suggestions/prompt-draft`,
  DRY_RUN: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-ai-suggestions/dry-run`,
  APPLY: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-ai-suggestions/apply`,
} as const;
