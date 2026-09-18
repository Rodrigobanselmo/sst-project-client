import { useFetch } from '@v2/hooks/api/useFetch';

import { readSystemRiskMatrix } from '../service/risk-matrix.service';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

export const useFetchReadSystemRiskMatrix = (enabled = true) => {
  return useFetch({
    queryKey: [...riskMatrixQueryKeys.system()],
    queryFn: () => readSystemRiskMatrix(),
    enabled,
    refetchOnMount: true,
  });
};
