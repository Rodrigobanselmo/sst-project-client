import type { SearchRiskCatalogItemsParams } from './risk-catalog-equivalence.types';

export function buildSearchQueryParams(params: SearchRiskCatalogItemsParams) {
  const query: Record<string, string | boolean> = { kind: params.kind };

  if (params.companyId) query.companyId = params.companyId;
  if (params.riskId) query.riskId = params.riskId;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.includeSystem !== undefined) {
    query.includeSystem = params.includeSystem;
  }
  if (params.includeDeleted !== undefined) {
    query.includeDeleted = params.includeDeleted;
  }

  return query;
}
