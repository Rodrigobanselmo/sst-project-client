export const CompanyExamRiskCoverageRoutes = {
  BASE: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-coverage`,
  DETAIL: (companyId: string, riskId: string) =>
    `/v2/companies/${companyId}/exam-risk-coverage/${riskId}`,
} as const;
