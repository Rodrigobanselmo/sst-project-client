import { useQuery } from '@tanstack/react-query';

import { browseSectorRiskPresence } from './browse-sector-risk-presence.service';
import { BrowseSectorRiskPresenceParams } from './sector-risk-presence.types';

export const SECTOR_RISK_PRESENCE_QUERY_KEY = 'V2_SECTOR_RISK_PRESENCE';

export const useFetchBrowseSectorRiskPresence = (
  params: BrowseSectorRiskPresenceParams,
  options?: { enabled?: boolean },
) => {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(params.companyId) &&
    Boolean(params.workspaceId);

  const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
    queryFn: async ({ signal }) => browseSectorRiskPresence(params, { signal }),
    queryKey: [SECTOR_RISK_PRESENCE_QUERY_KEY, params.companyId, params.workspaceId],
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
