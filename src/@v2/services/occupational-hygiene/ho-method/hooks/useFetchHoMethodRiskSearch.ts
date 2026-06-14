import { useFetch } from '@v2/hooks/api/useFetch';

import { searchHoMethodRiskFactors } from '../service/ho-method.service';
import { hoMethodQueryKeys } from './ho-method.query-keys';

export const useFetchHoMethodRiskSearch = (
  search: string,
  companyId?: string,
  enabled = true,
) => {
  const normalizedSearch = search.trim();

  return useFetch({
    queryKey: [
      ...hoMethodQueryKeys.all,
      'risk-search',
      companyId ?? '',
      normalizedSearch,
    ],
    queryFn: () =>
      searchHoMethodRiskFactors({
        companyId: companyId!,
        search: normalizedSearch,
      }),
    enabled: enabled && Boolean(companyId) && normalizedSearch.length > 0,
    refetchOnMount: true,
  });
};
