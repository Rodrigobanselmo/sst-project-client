import { useFetch } from '@v2/hooks/api/useFetch';

import { browseRiskSubTypesMaster } from '../risk-sub-type-master.service';
import { riskSubTypeMasterQueryKeys } from '../risk-sub-type-master.query-keys';
import type { IBrowseRiskSubTypesMasterParams } from '../risk-sub-type-master.types';

export const useFetchBrowseRiskSubTypesMaster = (
  params: IBrowseRiskSubTypesMasterParams,
) => {
  return useFetch({
    queryKey: [...riskSubTypeMasterQueryKeys.browse(params.type)],
    queryFn: () => browseRiskSubTypesMaster(params),
    enabled: Boolean(params.type),
  });
};
