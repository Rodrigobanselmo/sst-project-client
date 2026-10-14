import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { HomogeneousGroupRoutes } from '@v2/constants/routes/homogeneous-group.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import type {
  BrowseCatalogOnlyAiIdentificationHistoryParams,
  BrowseCatalogOnlyAiIdentificationHistoryResult,
} from './catalog-only-ai-identification-history.types';

export async function browseCatalogOnlyAiIdentificationHistory(
  params: BrowseCatalogOnlyAiIdentificationHistoryParams,
  options?: { signal?: AbortSignal },
): Promise<BrowseCatalogOnlyAiIdentificationHistoryResult> {
  const { companyId, workspaceId, entityKind, entityId, page } = params;

  const path =
    entityKind === 'GSE'
      ? HomogeneousGroupRoutes.CATALOG_ONLY_AI_IDENTIFICATION_HISTORY
      : CharacterizationRoutes.CHARACTERIZATION
          .CATALOG_ONLY_AI_IDENTIFICATION_HISTORY;

  const pathParams: Record<string, string> =
    entityKind === 'GSE'
      ? { companyId, workspaceId, gseId: entityId }
      : { companyId, workspaceId, characterizationId: entityId };

  const response = await api.get(
    bindUrlParams({
      path,
      pathParams,
      queryParams: page && page > 1 ? { page } : undefined,
    }),
    { signal: options?.signal },
  );

  return response.data;
}
