import type {
  BrowseFrpsCatalogAdminParams,
  BrowseFrpsExplainabilityLibraryParams,
  ReadFrpsCatalogConceptualStatusParams,
} from './frps-explainability-library.types';

export const frpsExplainabilityLibraryQueryKeys = {
  all: ['frps-explainability-library'],
  browse: (params: BrowseFrpsExplainabilityLibraryParams) => [
    'frps-explainability-library',
    'browse',
    params,
  ],
  catalogAdmin: (params: BrowseFrpsCatalogAdminParams) => [
    'frps-explainability-library',
    'catalog-admin',
    params,
  ],
  conceptualStatus: (params: ReadFrpsCatalogConceptualStatusParams) => [
    'frps-explainability-library',
    'conceptual-status',
    params,
  ],
  conceptualById: (id: string) => [
    'frps-explainability-library',
    'conceptual',
    id,
  ],
};
