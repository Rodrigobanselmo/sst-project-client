import { useFetch } from '@v2/hooks/api/useFetch';

import { searchRiskCatalogItems } from '../service/risk-catalog-equivalence.service';
import type { SearchRiskCatalogItemsParams } from '../service/risk-catalog-equivalence.types';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export const useFetchSearchRiskCatalogItems = (
  params: SearchRiskCatalogItemsParams | null,
) => {
  return useFetch({
    queryKey: riskCatalogEquivalenceQueryKeys.search(params!),
    queryFn: () => searchRiskCatalogItems(params!),
    enabled: Boolean(params?.kind),
    refetchOnMount: true,
  });
};
