import { useFetch } from '@v2/hooks/api/useFetch';

import { readRiskMatrix } from '../service/risk-matrix.service';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

export const useFetchReadRiskMatrix = (
  params: { companyId: string; matrixId: string },
  enabled = true,
) => {
  return useFetch({
    queryKey: [...riskMatrixQueryKeys.read(params.companyId, params.matrixId)],
    queryFn: () => readRiskMatrix(params),
    enabled: enabled && Boolean(params.companyId && params.matrixId),
    refetchOnMount: true,
  });
};
