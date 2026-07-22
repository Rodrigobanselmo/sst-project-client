import { useFetch } from '@v2/hooks/api/useFetch';

import { browseFrpsCatalogAdmin } from '../service/frps-explainability-library.service';
import { frpsExplainabilityLibraryQueryKeys } from '../service/frps-explainability-library.query-keys';
import type { BrowseFrpsCatalogAdminParams } from '../service/frps-explainability-library.types';

export function useFetchBrowseFrpsCatalogAdmin(
  params: BrowseFrpsCatalogAdminParams,
  enabled = true,
) {
  return useFetch({
    queryKey: frpsExplainabilityLibraryQueryKeys.catalogAdmin(params),
    queryFn: () => browseFrpsCatalogAdmin(params),
    enabled,
    refetchOnMount: true,
  });
}
