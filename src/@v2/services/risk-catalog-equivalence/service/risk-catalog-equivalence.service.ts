import { RiskCatalogEquivalenceRoutes } from '@v2/constants/routes/risk-catalog-equivalence.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  BrowseRiskCatalogEquivalencesParams,
  CreateRiskCatalogEquivalenceParams,
  PreviewRiskCatalogEquivalenceImpactParams,
  RevokeRiskCatalogEquivalenceParams,
  RiskCatalogEquivalence,
  RiskCatalogImpactPreview,
  RiskCatalogSearchItem,
  SearchRiskCatalogItemsParams,
} from './risk-catalog-equivalence.types';

function buildSearchQueryParams(params: SearchRiskCatalogItemsParams) {
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

export async function searchRiskCatalogItems(
  params: SearchRiskCatalogItemsParams,
): Promise<RiskCatalogSearchItem[]> {
  const response = await api.get<RiskCatalogSearchItem[]>(
    RiskCatalogEquivalenceRoutes.SEARCH,
    { params: buildSearchQueryParams(params) },
  );
  return response.data;
}

export async function browseRiskCatalogEquivalences(
  params: BrowseRiskCatalogEquivalencesParams,
): Promise<RiskCatalogEquivalence[]> {
  const response = await api.get<RiskCatalogEquivalence[]>(
    RiskCatalogEquivalenceRoutes.BASE,
    { params },
  );
  return response.data;
}

export async function previewRiskCatalogEquivalenceImpact(
  params: PreviewRiskCatalogEquivalenceImpactParams,
): Promise<RiskCatalogImpactPreview> {
  const response = await api.post<RiskCatalogImpactPreview>(
    RiskCatalogEquivalenceRoutes.IMPACT_PREVIEW,
    params,
  );
  return response.data;
}

export async function createRiskCatalogEquivalence(
  params: CreateRiskCatalogEquivalenceParams,
): Promise<RiskCatalogEquivalence> {
  const response = await api.post<RiskCatalogEquivalence>(
    RiskCatalogEquivalenceRoutes.BASE,
    params,
  );
  return response.data;
}

export async function revokeRiskCatalogEquivalence({
  id,
  revokeReason,
}: RevokeRiskCatalogEquivalenceParams): Promise<RiskCatalogEquivalence> {
  const response = await api.patch<RiskCatalogEquivalence>(
    bindUrlParams({
      path: RiskCatalogEquivalenceRoutes.REVOKE,
      pathParams: { id },
    }),
    { revokeReason },
  );
  return response.data;
}
