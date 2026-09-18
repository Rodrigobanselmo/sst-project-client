import { useFetch } from '@v2/hooks/api/useFetch';

import { readRiskMatrixVersion } from '../service/risk-matrix.service';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

export const useFetchReadRiskMatrixVersion = (
  params: { companyId: string; matrixId: string; versionId: string },
  enabled = true,
) => {
  return useFetch({
    queryKey: [
      ...riskMatrixQueryKeys.version(
        params.companyId,
        params.matrixId,
        params.versionId,
      ),
    ],
    queryFn: () => readRiskMatrixVersion(params),
    enabled:
      enabled &&
      Boolean(params.companyId && params.matrixId && params.versionId),
    refetchOnMount: true,
  });
};
