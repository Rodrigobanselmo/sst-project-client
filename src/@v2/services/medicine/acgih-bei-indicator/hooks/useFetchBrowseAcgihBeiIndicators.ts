import { useFetch } from '@v2/hooks/api/useFetch';

import { browseAcgihBeiIndicators } from '../service/acgih-bei-indicator.service';
import type { IBrowseAcgihBeiIndicatorsParams } from '../service/acgih-bei-indicator.types';
import { acgihBeiIndicatorQueryKeys } from './acgih-bei-indicator.query-keys';

export const useFetchBrowseAcgihBeiIndicators = (
  params: IBrowseAcgihBeiIndicatorsParams,
  enabled = true,
) =>
  useFetch({
    queryKey: acgihBeiIndicatorQueryKeys.browse(params),
    queryFn: () => browseAcgihBeiIndicators(params),
    enabled,
    refetchOnMount: true,
  });
