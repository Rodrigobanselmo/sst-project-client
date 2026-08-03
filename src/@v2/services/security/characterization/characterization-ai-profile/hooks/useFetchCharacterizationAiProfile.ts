import { useFetch } from '@v2/hooks/api/useFetch';

import { readCharacterizationAiProfile } from '../service/characterization-ai-profile.service';
import { characterizationAiProfileQueryKeys } from './characterization-ai-profile.query-keys';

export const useFetchCharacterizationAiProfile = (
  params: { companyId: string; profileId: string },
  enabled = true,
) => {
  return useFetch({
    queryKey: [...characterizationAiProfileQueryKeys.read(params)],
    queryFn: () => readCharacterizationAiProfile(params),
    enabled: enabled && Boolean(params.companyId && params.profileId),
    refetchOnMount: true,
  });
};
