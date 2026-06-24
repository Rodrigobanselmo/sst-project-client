import { useFetch } from '@v2/hooks/api/useFetch';

import { browseBiologicalIndicators } from '../service/biological-indicator.service';
import type { BrowseBiologicalIndicatorsParams } from '../service/biological-indicator.types';
import { biologicalIndicatorQueryKeys } from './biological-indicator.query-keys';

export const useFetchBrowseBiologicalIndicators = (
  params: BrowseBiologicalIndicatorsParams,
  enabled = true,
) =>
  useFetch({
    queryKey: biologicalIndicatorQueryKeys.browse(params),
    queryFn: () => browseBiologicalIndicators(params),
    enabled,
    refetchOnMount: true,
  });
