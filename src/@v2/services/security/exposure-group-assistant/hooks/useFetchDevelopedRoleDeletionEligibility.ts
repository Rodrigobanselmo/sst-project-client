import { useFetch } from '@v2/hooks/api/useFetch';

import { analyzeDevelopedRoleDeletion } from '../service/exposure-group-assistant.service';
import type { AnalyzeDevelopedRoleDeletionParams } from '../service/exposure-group-assistant.types';
import { exposureGroupAssistantQueryKeys } from './exposure-group-assistant.query-keys';

export const useFetchDevelopedRoleDeletionEligibility = (
  params: AnalyzeDevelopedRoleDeletionParams,
  enabled = true,
) => {
  return useFetch({
    queryKey: [
      ...exposureGroupAssistantQueryKeys.developedRoleDeletionEligibility(params),
    ],
    queryFn: () => analyzeDevelopedRoleDeletion(params),
    enabled:
      enabled &&
      Boolean(params.companyId && params.workspaceId && params.hierarchyId),
    refetchOnMount: true,
  });
};
