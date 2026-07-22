import { FormRoutes } from '@v2/constants/routes/forms.routes';
import { api } from 'core/services/apiClient';

import { buildFrpsExplainabilityLibraryQueryParams } from './frps-explainability-library-query.util';
import type {
  BrowseFrpsExplainabilityLibraryParams,
  FrpsLibraryBrowseResult,
} from './frps-explainability-library.types';

export { buildFrpsExplainabilityLibraryQueryParams };

export async function browseFrpsExplainabilityLibrary(
  params: BrowseFrpsExplainabilityLibraryParams,
): Promise<FrpsLibraryBrowseResult> {
  const response = await api.get<FrpsLibraryBrowseResult>(
    FormRoutes.FRPS_EXPLAINABILITY_LIBRARY.CONCEPTUAL,
    { params: buildFrpsExplainabilityLibraryQueryParams(params) },
  );
  return response.data;
}
