export const CompanyExamRiskCopyFromRiskRoutes = {
  EXECUTE: (companyId: string) =>
    `/v2/companies/${companyId}/exam-risk-copy-from-risk`,
} as const;
