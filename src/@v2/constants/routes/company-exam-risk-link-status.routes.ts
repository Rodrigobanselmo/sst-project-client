export const CompanyExamRiskLinkStatusRoutes = {
  BASE: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-link-status`,
} as const;
