import { useFetch } from '@v2/hooks/api/useFetch';

import { browseMatrixWorkspaceAvailability } from '../service/risk-matrix.service';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

export const useFetchMatrixWorkspaceAvailability = (
  companyId: string,
  matrixId: string | null,
  enabled = true,
) => {
  return useFetch({
    queryKey: [
      ...riskMatrixQueryKeys.matrixWorkspaceAvailability(
        companyId,
        matrixId ?? '',
      ),
    ],
    queryFn: () =>
      browseMatrixWorkspaceAvailability({
        companyId,
        matrixId: matrixId as string,
      }),
    enabled: enabled && Boolean(companyId) && Boolean(matrixId),
    refetchOnMount: true,
  });
};
