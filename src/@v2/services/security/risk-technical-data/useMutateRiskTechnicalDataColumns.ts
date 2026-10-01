import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RiskTechnicalColumnSetting, RiskTechnicalDataGroup } from './risk-technical-data.types';
import { updateRiskTechnicalDataColumns } from './update-risk-technical-data-columns.service';
import { RISK_TECHNICAL_DATA_QUERY_KEY } from './useFetchBrowseRiskTechnicalData';

export function useMutateRiskTechnicalDataColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      companyId: string;
      workspaceId: string;
      family: RiskTechnicalDataGroup;
      columns: RiskTechnicalColumnSetting[] | null;
    }) => updateRiskTechnicalDataColumns(params),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RISK_TECHNICAL_DATA_QUERY_KEY, variables.companyId, variables.workspaceId],
      });
    },
  });
}
