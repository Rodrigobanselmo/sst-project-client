import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RiskTechnicalColumnSetting, RiskTechnicalDataGroup } from './risk-technical-data.types';
import { updateSystemRiskTechnicalDataColumns } from './update-system-risk-technical-data-columns.service';
import { RISK_TECHNICAL_DATA_QUERY_KEY } from './useFetchBrowseRiskTechnicalData';

export function useMutateSystemRiskTechnicalDataColumns() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: {
      companyId: string;
      workspaceId: string;
      family: RiskTechnicalDataGroup;
      columns: RiskTechnicalColumnSetting[];
    }) => updateSystemRiskTechnicalDataColumns({ family: params.family, columns: params.columns }),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: [RISK_TECHNICAL_DATA_QUERY_KEY, variables.companyId, variables.workspaceId],
      });
    },
  });
}
