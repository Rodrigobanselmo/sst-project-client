import { useFetch } from '@v2/hooks/api/useFetch';

import { riskSubTypeMasterQueryKeys } from '../../risk-sub-type-master/risk-sub-type-master.query-keys';
import { browseCurationRisks } from '../risk-subtype-curation.service';
import type { IBrowseCurationRisksParams } from '../risk-subtype-curation.types';

export const useFetchBrowseCurationRisks = (
  params: IBrowseCurationRisksParams,
) => {
  return useFetch({
    queryKey: [...riskSubTypeMasterQueryKeys.curationRisks(params)],
    queryFn: () => browseCurationRisks(params),
    enabled: Boolean(params.type),
  });
};
