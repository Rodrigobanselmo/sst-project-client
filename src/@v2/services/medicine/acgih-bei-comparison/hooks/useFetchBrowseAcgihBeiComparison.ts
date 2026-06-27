import { useFetch } from '@v2/hooks/api/useFetch';

import { browseAcgihBeiComparison } from '../service/acgih-bei-comparison.service';
import type { IBrowseAcgihBeiComparisonParams } from '../service/acgih-bei-comparison.types';
import { acgihBeiComparisonQueryKeys } from './acgih-bei-comparison.query-keys';

export const useFetchBrowseAcgihBeiComparison = (
  params: IBrowseAcgihBeiComparisonParams,
  enabled = true,
) =>
  useFetch({
    queryKey: acgihBeiComparisonQueryKeys.browse(params),
    queryFn: () => browseAcgihBeiComparison(params),
    enabled,
    refetchOnMount: true,
  });
