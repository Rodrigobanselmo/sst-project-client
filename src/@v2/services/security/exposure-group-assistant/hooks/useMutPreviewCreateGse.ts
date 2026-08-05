import { useMutate } from '@v2/hooks/api/useMutate';

import { previewCreateGseFromProposal } from '../service/exposure-group-assistant.service';
import type { CreateGsePreviewParams } from '../service/exposure-group-assistant.types';

export function useMutPreviewCreateGse() {
  return useMutate({
    mutationFn: (params: CreateGsePreviewParams) =>
      previewCreateGseFromProposal(params),
    invalidateManyQueryKeys: () => [],
  });
}
