import type { BrowseHoMethodsParams } from '../service/ho-method.types';

export const hoMethodQueryKeys = {
  all: ['ho-methods'] as const,
  browse: (params: BrowseHoMethodsParams) =>
    [...hoMethodQueryKeys.all, 'browse', params] as const,
  read: (id: string) => [...hoMethodQueryKeys.all, 'read', id] as const,
  samplers: (search: string) =>
    [...hoMethodQueryKeys.all, 'samplers', search] as const,
  extractionSolvents: (search: string) =>
    [...hoMethodQueryKeys.all, 'extraction-solvents', search] as const,
  laboratories: (search: string) =>
    [...hoMethodQueryKeys.all, 'laboratories', search] as const,
};
