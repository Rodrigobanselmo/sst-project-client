export const CompanyExamRiskGapsRoutes = {
  BASE: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-gaps`,
} as const;
