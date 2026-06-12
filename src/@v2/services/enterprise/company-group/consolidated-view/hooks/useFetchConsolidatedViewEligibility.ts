import { QueryEnum } from 'core/enums/query.enums';
import { useFetch } from '@v2/hooks/api/useFetch';

import { readConsolidatedViewEligibility } from '../service/read-consolidated-view-eligibility.service';

export const useFetchConsolidatedViewEligibility = (
  params: { companyGroupId: number; applicationIds?: string[] },
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryKey: [
      QueryEnum.COMPANY,
      'consolidated-view-eligibility',
      params.companyGroupId,
      params.applicationIds,
    ],
    queryFn: () => readConsolidatedViewEligibility(params),
    enabled: options?.enabled ?? true,
  });

  return {
    ...response,
    eligibility: data,
  };
};
