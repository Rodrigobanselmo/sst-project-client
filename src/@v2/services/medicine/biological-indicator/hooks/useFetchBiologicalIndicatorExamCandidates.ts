import { useFetch } from '@v2/hooks/api/useFetch';

import { searchBiologicalIndicatorExamCandidates } from '../service/biological-indicator.service';
import type { SearchExamCandidatesParams } from '../service/biological-indicator.types';
import { biologicalIndicatorQueryKeys } from './biological-indicator.query-keys';

export const useFetchBiologicalIndicatorExamCandidates = (
  params: SearchExamCandidatesParams,
  enabled = true,
) =>
  useFetch({
    queryKey: biologicalIndicatorQueryKeys.examCandidates(
      params.search ?? '',
      params.material ?? '',
    ),
    queryFn: () => searchBiologicalIndicatorExamCandidates(params),
    enabled:
      enabled && Boolean(params.search?.trim() || params.material?.trim()),
    refetchOnMount: false,
  });
