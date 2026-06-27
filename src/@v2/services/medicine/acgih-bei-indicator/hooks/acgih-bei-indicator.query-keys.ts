import type { IBrowseAcgihBeiIndicatorsParams } from '../service/acgih-bei-indicator.types';

export const acgihBeiIndicatorQueryKeys = {
  all: () => ['acgih-bei-indicator'],
  browse: (params?: IBrowseAcgihBeiIndicatorsParams) => [
    'acgih-bei-indicator',
    'browse',
    params ?? {},
  ],
  detail: (id: string) => ['acgih-bei-indicator', 'detail', id],
};
