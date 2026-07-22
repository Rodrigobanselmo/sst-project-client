import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

import {
  buildFrpsCatalogAdminQueryParams,
  buildFrpsExplainabilityLibraryQueryParams,
} from './frps-explainability-library-query.util';
import { buildFrpsLibraryGeneratePayload } from './frps-library-generate-payload.util';
import type {
  BrowseFrpsCatalogAdminParams,
  BrowseFrpsExplainabilityLibraryParams,
  FrpsCatalogAdminBrowseResult,
  FrpsCatalogConceptualStatusResult,
  FrpsLibraryBrowseResult,
  GenerateFrpsLibraryConceptualParams,
  GenerateFrpsLibraryConceptualResult,
  ReadFrpsCatalogConceptualStatusParams,
  ReadFrpsConceptualExplanationByIdResult,
} from './frps-explainability-library.types';

export { buildFrpsExplainabilityLibraryQueryParams };
export { buildFrpsCatalogAdminQueryParams };
export { buildFrpsLibraryGeneratePayload };

export async function browseFrpsExplainabilityLibrary(
  params: BrowseFrpsExplainabilityLibraryParams,
): Promise<FrpsLibraryBrowseResult> {
  const response = await api.get<FrpsLibraryBrowseResult>(
    FormRoutes.FRPS_EXPLAINABILITY_LIBRARY.CONCEPTUAL,
    { params: buildFrpsExplainabilityLibraryQueryParams(params) },
  );
  return response.data;
}

export async function browseFrpsCatalogAdmin(
  params: BrowseFrpsCatalogAdminParams,
): Promise<FrpsCatalogAdminBrowseResult> {
  const response = await api.get<FrpsCatalogAdminBrowseResult>(
    FormRoutes.FRPS_EXPLAINABILITY_LIBRARY.CATALOG_ADMIN,
    { params: buildFrpsCatalogAdminQueryParams(params) },
  );
  return response.data;
}

export async function readFrpsCatalogConceptualStatus(
  params: ReadFrpsCatalogConceptualStatusParams,
): Promise<FrpsCatalogConceptualStatusResult> {
  const response = await api.get<FrpsCatalogConceptualStatusResult>(
    FormRoutes.FRPS_EXPLAINABILITY_LIBRARY.CONCEPTUAL_STATUS,
    {
      params: {
        itemType: params.itemType,
        catalogId: params.catalogId,
      },
    },
  );
  return response.data;
}

export async function generateFrpsLibraryConceptual(
  params: GenerateFrpsLibraryConceptualParams,
): Promise<GenerateFrpsLibraryConceptualResult> {
  const response = await api.post<GenerateFrpsLibraryConceptualResult>(
    FormRoutes.FRPS_EXPLAINABILITY_LIBRARY.CONCEPTUAL_GENERATE,
    buildFrpsLibraryGeneratePayload(params),
  );
  return response.data;
}

export async function readFrpsConceptualExplanationById(
  id: string,
): Promise<ReadFrpsConceptualExplanationByIdResult> {
  const response = await api.get<ReadFrpsConceptualExplanationByIdResult>(
    bindUrlParams({
      path: FormRoutes.AI_EXPLANATIONS.CONCEPTUAL,
      pathParams: { id },
    }),
  );
  return response.data;
}
