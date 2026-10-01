import { useQuery } from '@tanstack/react-query';

import { browseRiskTechnicalData } from './browse-risk-technical-data.service';
import { BrowseRiskTechnicalDataParams } from './risk-technical-data.types';

export const RISK_TECHNICAL_DATA_QUERY_KEY = 'V2_RISK_TECHNICAL_DATA';

export const useFetchBrowseRiskTechnicalData = (
  params: BrowseRiskTechnicalDataParams,
  options?: { enabled?: boolean },
) => {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(params.companyId) &&
    Boolean(params.workspaceId);

  const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
    queryFn: async ({ signal }) => browseRiskTechnicalData(params, { signal }),
    queryKey: [RISK_TECHNICAL_DATA_QUERY_KEY, params.companyId, params.workspaceId],
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
