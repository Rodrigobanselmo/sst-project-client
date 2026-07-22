import { useFetch } from '@v2/hooks/api/useFetch';

import { readFrpsConceptualExplanationById } from '../service/frps-explainability-library.service';
import { frpsExplainabilityLibraryQueryKeys } from '../service/frps-explainability-library.query-keys';

export function useFetchFrpsConceptualExplanationById(
  id: string | null,
  enabled = true,
) {
  return useFetch({
    queryKey: frpsExplainabilityLibraryQueryKeys.conceptualById(id || ''),
    queryFn: () => readFrpsConceptualExplanationById(id as string),
    enabled: Boolean(id) && enabled,
    refetchOnMount: true,
  });
}
