import { useFetch } from '@v2/hooks/api/useFetch';

import { browseCharacterizationAiProfiles } from '../service/characterization-ai-profile.service';
import { characterizationAiProfileQueryKeys } from './characterization-ai-profile.query-keys';

export const useFetchBrowseCharacterizationAiProfiles = (
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
    queryKey: [...characterizationAiProfileQueryKeys.browse(params)],
    queryFn: () => browseCharacterizationAiProfiles(params),
    enabled: enabled && Boolean(params.companyId),
    refetchOnMount: true,
  });
};
