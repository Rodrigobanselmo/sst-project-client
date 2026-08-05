import { useFetch } from '@v2/hooks/api/useFetch';

import { runSimilarityProposals } from '../service/exposure-group-assistant.service';
import type { RunSimilarityProposalsParams } from '../service/exposure-group-assistant.types';
import { exposureGroupAssistantQueryKeys } from './exposure-group-assistant.query-keys';

export const useFetchSimilarityProposals = (
  params: RunSimilarityProposalsParams,
  enabled = true,
) => {
  return useFetch({
    queryKey: [...exposureGroupAssistantQueryKeys.similarityProposals(params)],
    queryFn: () => runSimilarityProposals(params),
    enabled: enabled && Boolean(params.companyId && params.workspaceId),
    refetchOnMount: true,
  });
};
