import { useMutate } from '@v2/hooks/api/useMutate';

import { createGseFromProposal } from '../service/exposure-group-assistant.service';
import type { CreateGseFromProposalParams } from '../service/exposure-group-assistant.types';
import { exposureGroupAssistantQueryKeys } from './exposure-group-assistant.query-keys';

export function useMutCreateGseFromProposal() {
  return useMutate({
    mutationFn: (params: CreateGseFromProposalParams) =>
      createGseFromProposal(params),
    invalidateManyQueryKeys: () => [[...exposureGroupAssistantQueryKeys.all]],
  });
}
