import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RiskInventoryColumnSetting, RiskInventoryExtraColumnSetting } from './risk-inventory.types';
import { updateSystemRiskInventoryColumns } from './update-system-risk-inventory-columns.service';
import { RISK_INVENTORY_QUERY_KEY } from './useFetchBrowseRiskInventory';

export function useMutateSystemRiskInventoryColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      companyId: string;
      workspaceId: string;
      columns: RiskInventoryColumnSetting[];
      extraColumns?: RiskInventoryExtraColumnSetting[];
      columnOrder?: string[];
    }) =>
      updateSystemRiskInventoryColumns({
        columns: params.columns,
        extraColumns: params.extraColumns,
        columnOrder: params.columnOrder,
      }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RISK_INVENTORY_QUERY_KEY, variables.companyId, variables.workspaceId],
      });
    },
  });
}
