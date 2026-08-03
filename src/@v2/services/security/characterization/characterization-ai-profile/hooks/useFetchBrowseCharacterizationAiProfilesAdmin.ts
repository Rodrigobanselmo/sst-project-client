import { useFetch } from '@v2/hooks/api/useFetch';

import { browseCharacterizationAiProfilesAdmin } from '../service/characterization-ai-profile.service';
import { characterizationAiProfileQueryKeys } from './characterization-ai-profile.query-keys';

export const useFetchBrowseCharacterizationAiProfilesAdmin = (
  params: {
    companyId: string;
    search?: string;
    isActive?: 'all' | 'true' | 'false';
    page?: number;
    limit?: number;
  },
  enabled = true,
) => {
  return useFetch({
    queryKey: [...characterizationAiProfileQueryKeys.adminBrowse(params)],
    queryFn: () => browseCharacterizationAiProfilesAdmin(params),
    enabled: enabled && Boolean(params.companyId),
    refetchOnMount: true,
  });
};
