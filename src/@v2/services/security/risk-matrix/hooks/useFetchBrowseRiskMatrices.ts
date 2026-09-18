import { useFetch } from '@v2/hooks/api/useFetch';

import { browseRiskMatrices } from '../service/risk-matrix.service';
import { riskMatrixQueryKeys } from './risk-matrix.query-keys';

export const useFetchBrowseRiskMatrices = (
  companyId: string,
  enabled = true,
) => {
  return useFetch({
    queryKey: [...riskMatrixQueryKeys.browse(companyId)],
    queryFn: () => browseRiskMatrices({ companyId }),
    enabled: enabled && Boolean(companyId),
    refetchOnMount: true,
  });
};
