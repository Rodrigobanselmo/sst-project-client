import type {
  BrowseRiskCatalogEquivalencesParams,
  PreviewRiskCatalogEquivalenceImpactParams,
  SearchRiskCatalogItemsParams,
} from '../service/risk-catalog-equivalence.types';

export const riskCatalogEquivalenceQueryKeys = {
  search: (params: SearchRiskCatalogItemsParams) => [
    'risk-catalog-equivalence',
    'search',
    params,
  ],
  browse: (params: BrowseRiskCatalogEquivalencesParams) => [
    'risk-catalog-equivalence',
    'browse',
    params,
  ],
  impactPreview: (params: PreviewRiskCatalogEquivalenceImpactParams) => [
    'risk-catalog-equivalence',
    'impact-preview',
    params,
  ],
};
