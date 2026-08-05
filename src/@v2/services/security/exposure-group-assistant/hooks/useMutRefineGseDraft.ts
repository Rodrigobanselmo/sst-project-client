import { useMutate } from '@v2/hooks/api/useMutate';

import { refineGseDraft } from '../service/exposure-group-assistant.service';
import type { RefineGseDraftParams } from '../service/exposure-group-assistant.types';

export function useMutRefineGseDraft() {
  return useMutate({
    mutationFn: (params: RefineGseDraftParams) => refineGseDraft(params),
    invalidateManyQueryKeys: () => [],
  });
}
