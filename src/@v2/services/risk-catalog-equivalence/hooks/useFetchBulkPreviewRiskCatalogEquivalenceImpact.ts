import { useMemo } from 'react';

import { useQueries } from '@tanstack/react-query';

import { previewRiskCatalogEquivalenceImpact } from '../service/risk-catalog-equivalence.service';
import type {
  PreviewRiskCatalogEquivalenceImpactParams,
  RiskCatalogImpactPreview,
  RiskCatalogKind,
  RiskCatalogSearchItem,
} from '../service/risk-catalog-equivalence.types';
import { getCatalogScopeBlockReason } from '../utils/risk-catalog-equivalence-scope.util';
import { riskCatalogEquivalenceQueryKeys } from './risk-catalog-equivalence.query-keys';

export type RiskCatalogAliasPreview = {
  alias: RiskCatalogSearchItem;
  params: PreviewRiskCatalogEquivalenceImpactParams;
  data?: RiskCatalogImpactPreview;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
};

export const useFetchBulkPreviewRiskCatalogEquivalenceImpact = (
  canonicalItem: RiskCatalogSearchItem | null,
  aliasItems: RiskCatalogSearchItem[],
  kind: RiskCatalogKind,
) => {
  const pairs = useMemo(() => {
    if (!canonicalItem) return [];

    return aliasItems
      .filter((alias) => !getCatalogScopeBlockReason(canonicalItem, alias))
      .map((alias) => ({
        alias,
        params: {
          kind,
          riskId: canonicalItem.riskId,
          canonicalId: canonicalItem.id,
          aliasId: alias.id,
        } satisfies PreviewRiskCatalogEquivalenceImpactParams,
      }));
  }, [canonicalItem, aliasItems, kind]);

  const queries = useQueries({
    queries: pairs.map(({ params }) => ({
      queryKey: riskCatalogEquivalenceQueryKeys.impactPreview(params),
      queryFn: () => previewRiskCatalogEquivalenceImpact(params),
      enabled: Boolean(
        params.kind &&
          params.riskId &&
          params.canonicalId &&
          params.aliasId &&
          params.canonicalId !== params.aliasId,
      ),
      retry: false,
      refetchOnMount: true,
    })),
  });

  const previews: RiskCatalogAliasPreview[] = pairs.map((pair, index) => ({
    alias: pair.alias,
    params: pair.params,
    data: queries[index]?.data,
    isLoading: queries[index]?.isLoading ?? false,
    isError: queries[index]?.isError ?? false,
    error: queries[index]?.error,
  }));

  return {
    previews,
    isLoading: previews.some((p) => p.isLoading),
    isError: previews.some((p) => p.isError),
    allLoaded:
      previews.length > 0 && previews.every((p) => p.data && !p.isLoading),
  };
};
