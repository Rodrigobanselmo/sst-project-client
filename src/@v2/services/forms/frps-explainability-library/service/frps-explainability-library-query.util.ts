import type { BrowseFrpsExplainabilityLibraryParams } from './frps-explainability-library.types';

export function buildFrpsExplainabilityLibraryQueryParams(
  params: BrowseFrpsExplainabilityLibraryParams,
): Record<string, string | number | boolean> {
  const query: Record<string, string | number | boolean> = {};

  if (params.riskType) query.riskType = params.riskType;
  if (params.riskSubTypeEnum) query.riskSubTypeEnum = params.riskSubTypeEnum;
  if (params.riskSubTypeId != null) query.riskSubTypeId = params.riskSubTypeId;
  if (params.riskId) query.riskId = params.riskId;
  if (params.kind) query.kind = params.kind;
  if (params.status) query.status = params.status;
  if (params.search?.trim()) query.search = params.search.trim();
  if (params.page != null) query.page = params.page;
  if (params.limit != null) query.limit = params.limit;
  if (params.sortBy) query.sortBy = params.sortBy;
  if (params.sortOrder) query.sortOrder = params.sortOrder;
  if (params.generalCatalog) query.generalCatalog = true;

  return query;
}
