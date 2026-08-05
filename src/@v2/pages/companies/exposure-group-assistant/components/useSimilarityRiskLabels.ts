import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryRisks } from 'core/services/hooks/queries/useQueryRisks/useQueryRisks';

/**
 * Loads company risk catalog once for consultative label resolution.
 * Presentation only — does not alter similarity scoring.
 */
export function useSimilarityRiskLabels(companyId: string, enabled = true) {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['similarity-risk-labels', companyId],
    queryFn: () =>
      queryRisks({ skip: 0, take: 5_000 }, { companyId }),
    enabled: Boolean(companyId) && enabled,
    staleTime: 1000 * 60 * 30,
  });

  const labels = useMemo(() => {
    const map = new Map<string, { name: string; code?: string | null }>();
    for (const risk of data?.data ?? []) {
      map.set(risk.id, {
        name: risk.name,
        code: risk.esocialCode ?? null,
      });
    }
    return map;
  }, [data]);

  return { labels, isLoading, isError, count: labels.size };
}
