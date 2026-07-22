import { useFetch } from '@v2/hooks/api/useFetch';

import { readFrpsCatalogConceptualStatus } from '../service/frps-explainability-library.service';
import { frpsExplainabilityLibraryQueryKeys } from '../service/frps-explainability-library.query-keys';
import type { ReadFrpsCatalogConceptualStatusParams } from '../service/frps-explainability-library.types';

export function useFetchFrpsCatalogConceptualStatus(
  params: ReadFrpsCatalogConceptualStatusParams | null,
  enabled = true,
) {
  return useFetch({
    queryKey: frpsExplainabilityLibraryQueryKeys.conceptualStatus(
      params ?? { itemType: 'SOURCE', catalogId: '' },
    ),
    queryFn: () => readFrpsCatalogConceptualStatus(params!),
    enabled: Boolean(enabled && params?.catalogId && params?.itemType),
    refetchOnMount: true,
  });
}
