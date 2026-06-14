import { useFetch } from '@v2/hooks/api/useFetch';

import { readHoMethod } from '../service/ho-method.service';
import { hoMethodQueryKeys } from './ho-method.query-keys';

export const useFetchReadHoMethod = (id: string | null, enabled = true) => {
  return useFetch({
    queryKey: [...hoMethodQueryKeys.read(id ?? '')],
    queryFn: () => readHoMethod(id as string),
    enabled: enabled && Boolean(id),
    refetchOnMount: true,
  });
};
