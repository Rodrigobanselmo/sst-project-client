import type { BrowseFrpsExplainabilityLibraryParams } from './frps-explainability-library.types';

export const frpsExplainabilityLibraryQueryKeys = {
  all: ['frps-explainability-library'],
  browse: (params: BrowseFrpsExplainabilityLibraryParams) => [
    'frps-explainability-library',
    'browse',
    params,
  ],
  conceptualById: (id: string) => [
    'frps-explainability-library',
    'conceptual',
    id,
  ],
};
