import { useMutation, useQueryClient } from '@tanstack/react-query';

import { RISK_PRIORITIZATION_QUERY_KEY } from './useFetchBrowseRiskPrioritization';
import {
  PrioritizationMatrixOrientation,
  RiskPrioritizationBrowseResult,
} from './risk-prioritization.types';
import { updateRiskPrioritizationOrientation } from './update-risk-prioritization-orientation.service';

export function useMutateRiskPrioritizationOrientation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateRiskPrioritizationOrientation,
    onSuccess: (result, variables) => {
      queryClient.setQueryData<RiskPrioritizationBrowseResult>(
        [RISK_PRIORITIZATION_QUERY_KEY, variables.companyId, variables.workspaceId],
        (current) =>
          current
            ? { ...current, matrixOrientation: result.matrixOrientation }
            : current,
      );
    },
  });
}
