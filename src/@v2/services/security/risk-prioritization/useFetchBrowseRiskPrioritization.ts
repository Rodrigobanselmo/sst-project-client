import { useQuery } from '@tanstack/react-query';

import { browseRiskPrioritization } from './browse-risk-prioritization.service';
import { BrowseRiskPrioritizationParams } from './risk-prioritization.types';

export const RISK_PRIORITIZATION_QUERY_KEY = 'V2_RISK_PRIORITIZATION_BROWSE';

export const useFetchBrowseRiskPrioritization = (
  params: BrowseRiskPrioritizationParams,
  options?: { enabled?: boolean },
) => {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(params.companyId) &&
    Boolean(params.workspaceId);

  const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
    queryFn: async ({ signal }) => browseRiskPrioritization(params, { signal }),
    queryKey: [
      RISK_PRIORITIZATION_QUERY_KEY,
      params.companyId,
      params.workspaceId,
    ],
    enabled,
  });

  return {
    data: isError ? undefined : data,
    error,
    isError,
    isLoading: enabled && isLoading,
    isFetching,
    refetch,
  };
};
