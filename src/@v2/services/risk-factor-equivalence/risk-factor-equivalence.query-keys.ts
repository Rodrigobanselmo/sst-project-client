export const riskFactorEquivalenceQueryKeys = {
  browse: (companyId: string, aliasRiskId: string) =>
    ['risk-factor-equivalence', 'browse', companyId, aliasRiskId] as const,
  searchSystemRisks: (search: string, type?: string) =>
    ['risk-factor-equivalence', 'search-system-risks', search, type] as const,
};
