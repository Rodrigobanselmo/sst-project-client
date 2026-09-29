import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RiskInventoryBrowseResult } from './risk-inventory.types';
import { updateRiskInventoryColumns } from './update-risk-inventory-columns.service';
import { RISK_INVENTORY_QUERY_KEY } from './useFetchBrowseRiskInventory';

export function useMutateRiskInventoryColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRiskInventoryColumns,
    onSuccess: (result, variables) => {
      if (variables.columns === null) {
        queryClient.invalidateQueries({
          queryKey: [RISK_INVENTORY_QUERY_KEY, variables.companyId, variables.workspaceId],
        });
        return;
      }
      queryClient.setQueryData<RiskInventoryBrowseResult>(
        [RISK_INVENTORY_QUERY_KEY, variables.companyId, variables.workspaceId],
        (current) =>
          current
            ? {
                ...current,
                columnPreference: result.columnPreference,
                columnPreferenceSource: 'workspace',
              }
            : current,
      );
    },
  });
}
