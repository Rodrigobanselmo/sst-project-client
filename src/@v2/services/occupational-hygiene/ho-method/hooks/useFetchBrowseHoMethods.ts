import { useFetch } from '@v2/hooks/api/useFetch';

import { browseHoMethods } from '../service/ho-method.service';
import type { BrowseHoMethodsParams } from '../service/ho-method.types';
import { hoMethodQueryKeys } from './ho-method.query-keys';

export const useFetchBrowseHoMethods = (
  params: BrowseHoMethodsParams,
  enabled = true,
) => {
  return useFetch({
    queryKey: [...hoMethodQueryKeys.browse(params)],
    queryFn: () => browseHoMethods(params),
    enabled,
    refetchOnMount: true,
  });
};
