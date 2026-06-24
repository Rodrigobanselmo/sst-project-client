import { useFetch } from '@v2/hooks/api/useFetch';

import { getBiologicalIndicatorById } from '../service/biological-indicator.service';
import { biologicalIndicatorQueryKeys } from './biological-indicator.query-keys';

export const useFetchBiologicalIndicatorById = (id: string, enabled = true) =>
  useFetch({
    queryKey: biologicalIndicatorQueryKeys.detail(id),
    queryFn: () => getBiologicalIndicatorById(id),
    enabled: enabled && Boolean(id),
    refetchOnMount: true,
  });
