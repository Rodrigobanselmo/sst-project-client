import { useQuery } from '@tanstack/react-query';

import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';

import { browseCatalogOnlyAiIdentificationHistory } from '../service/browse-catalog-only-ai-identification-history.service';
import type { BrowseCatalogOnlyAiIdentificationHistoryParams } from '../service/catalog-only-ai-identification-history.types';

export function useFetchCatalogOnlyAiIdentificationHistory(
  params: BrowseCatalogOnlyAiIdentificationHistoryParams | null,
  options?: { enabled?: boolean; refreshToken?: number },
) {
  const enabled =
    (options?.enabled ?? true) &&
    Boolean(
      params?.companyId &&
        params?.workspaceId &&
        params?.entityId &&
        params?.entityKind,
    );

  return useQuery({
    queryKey: [
      QueryKeyCharacterizationEnum.CATALOG_ONLY_AI_IDENTIFICATION_HISTORY,
      params?.companyId,
      params?.workspaceId,
      params?.entityKind,
      params?.entityId,
      params?.page || 1,
      options?.refreshToken || 0,
    ],
    queryFn: async ({ signal }) => {
      if (!params) {
        throw new Error('Parâmetros de histórico ausentes.');
      }
      return browseCatalogOnlyAiIdentificationHistory(params, { signal });
    },
    enabled,
  });
}
