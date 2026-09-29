import { useQuery } from '@tanstack/react-query';

import { browseRiskInventory } from './browse-risk-inventory.service';
import { BrowseRiskInventoryParams } from './risk-inventory.types';

export const RISK_INVENTORY_QUERY_KEY = 'V2_RISK_INVENTORY_BROWSE';

export const useFetchBrowseRiskInventory = (
  params: BrowseRiskInventoryParams,
  options?: { enabled?: boolean },
) => {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(params.companyId) &&
    Boolean(params.workspaceId);

  const { data, error, isError, isLoading, isFetching, refetch } = useQuery({
    queryFn: async ({ signal }) => browseRiskInventory(params, { signal }),
    queryKey: [RISK_INVENTORY_QUERY_KEY, params.companyId, params.workspaceId],
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
