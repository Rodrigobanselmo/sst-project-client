import { useFetch } from '@v2/hooks/api/useFetch';

import { previewRiskCatalogEquivalenceImpact } from '../service/risk-catalog-equivalence.service';
import type { PreviewRiskCatalogEquivalenceImpactParams } from '../service/risk-catalog-equivalence.types';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export const useFetchPreviewRiskCatalogEquivalenceImpact = (
  params: PreviewRiskCatalogEquivalenceImpactParams | null,
) => {
  const enabled = Boolean(
    params?.kind &&
      params?.riskId &&
      params?.canonicalId &&
      params?.aliasId &&
      params.canonicalId !== params.aliasId,
  );

  return useFetch({
    queryKey: riskCatalogEquivalenceQueryKeys.impactPreview(params!),
    queryFn: () => previewRiskCatalogEquivalenceImpact(params!),
    enabled,
    refetchOnMount: true,
  });
};
