import { useFetch } from '@v2/hooks/api/useFetch';

import { browseFrpsExplainabilityLibrary } from '../service/frps-explainability-library.service';
import { frpsExplainabilityLibraryQueryKeys } from '../service/frps-explainability-library.query-keys';
import type { BrowseFrpsExplainabilityLibraryParams } from '../service/frps-explainability-library.types';

export function useFetchBrowseFrpsExplainabilityLibrary(
  params: BrowseFrpsExplainabilityLibraryParams,
  enabled = true,
) {
  return useFetch({
    queryKey: frpsExplainabilityLibraryQueryKeys.browse(params),
    queryFn: () => browseFrpsExplainabilityLibrary(params),
    enabled,
    refetchOnMount: true,
  });
}
