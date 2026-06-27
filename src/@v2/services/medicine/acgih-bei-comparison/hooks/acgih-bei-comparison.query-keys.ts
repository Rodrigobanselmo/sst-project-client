import type { IBrowseAcgihBeiComparisonParams } from '../service/acgih-bei-comparison.types';

export const acgihBeiComparisonQueryKeys = {
  all: () => ['acgih-bei-comparison'],
  browse: (params?: IBrowseAcgihBeiComparisonParams) => [
    'acgih-bei-comparison',
    'browse',
    params ?? {},
  ],
};
