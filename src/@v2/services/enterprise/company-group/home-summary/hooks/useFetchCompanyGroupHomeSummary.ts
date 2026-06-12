import { QueryEnum } from 'core/enums/query.enums';
import { useFetch } from '@v2/hooks/api/useFetch';

import { readCompanyGroupHomeSummary } from '../service/read-company-group-home-summary.service';

export const useFetchCompanyGroupHomeSummary = (
  params: { companyGroupId: number },
  options?: { enabled?: boolean },
) => {
  const { data, ...response } = useFetch({
    queryKey: [
      QueryEnum.COMPANY,
      'company-group-home-summary',
      params.companyGroupId,
    ],
    queryFn: () => readCompanyGroupHomeSummary(params),
    enabled: options?.enabled ?? true,
  });

  return {
    ...response,
    summary: data,
  };
};
