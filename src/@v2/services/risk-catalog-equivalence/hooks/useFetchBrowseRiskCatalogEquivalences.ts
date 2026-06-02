import { useFetch } from '@v2/hooks/api/useFetch';

import { browseRiskCatalogEquivalences } from '../service/risk-catalog-equivalence.service';
import type { BrowseRiskCatalogEquivalencesParams } from '../service/risk-catalog-equivalence.types';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export const useFetchBrowseRiskCatalogEquivalences = (
  params: BrowseRiskCatalogEquivalencesParams,
  enabled = true,
) => {
  return useFetch({
    queryKey: riskCatalogEquivalenceQueryKeys.browse(params),
    queryFn: () => browseRiskCatalogEquivalences(params),
    enabled,
    refetchOnMount: true,
  });
};
