import type { BrowseBiologicalIndicatorsParams } from '../service/biological-indicator.types';

export const biologicalIndicatorQueryKeys = {
  browse: (params: BrowseBiologicalIndicatorsParams) => [
    'biological-indicator',
    'browse',
    params,
  ],
  detail: (id: string) => ['biological-indicator', 'detail', id],
  pendencies: (id: string) => ['biological-indicator', 'pendencies', id],
  riskLinks: (id: string) => ['biological-indicator', 'risk-links', id],
  examLinks: (id: string) => ['biological-indicator', 'exam-links', id],
  examCandidates: (search: string, material: string) => [
    'biological-indicator',
    'exam-candidates',
    search,
    material,
  ],
};
