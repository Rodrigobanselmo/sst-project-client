import { QueryEnum } from 'core/enums/query.enums';
import { useFetch } from '@v2/hooks/api/useFetch';

import { readConsolidatedViewSummary } from '../service/read-consolidated-view-summary.service';

export const useFetchConsolidatedViewSummary = (
  params: { companyGroupId: number; applicationIds?: string[] },
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryKey: [
      QueryEnum.COMPANY,
      'consolidated-view-summary',
      params.companyGroupId,
      params.applicationIds,
    ],
    queryFn: () => readConsolidatedViewSummary(params),
    enabled: options?.enabled ?? true,
  });

  return {
    ...response,
    summary: data,
  };
};
