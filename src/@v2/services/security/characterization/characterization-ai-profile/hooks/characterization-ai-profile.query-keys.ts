import { QueryKeyCharacterizationEnum } from '@v2/constants/enums/characterization-query-key.enum';

export const characterizationAiProfileQueryKeys = {
  all: [QueryKeyCharacterizationEnum.AI_PROFILES] as const,
  browse: (params: {
    companyId: string;
    search?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) =>
    [
      ...characterizationAiProfileQueryKeys.all,
      'browse',
      params.companyId,
      params.search ?? '',
      params.isActive ?? 'all',
      params.page ?? 1,
      params.limit ?? 50,
    ] as const,
  adminBrowse: (params: {
    companyId: string;
    search?: string;
    isActive?: string;
    page?: number;
    limit?: number;
  }) =>
    [
      ...characterizationAiProfileQueryKeys.all,
      'admin-browse',
      params.companyId,
      params.search ?? '',
      params.isActive ?? 'all',
      params.page ?? 1,
      params.limit ?? 50,
    ] as const,
  read: (params: { companyId: string; profileId: string }) =>
    [
      ...characterizationAiProfileQueryKeys.all,
      'read',
      params.companyId,
      params.profileId,
    ] as const,
};
