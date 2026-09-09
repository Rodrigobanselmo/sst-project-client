import { useMutate } from '@v2/hooks/api/useMutate';

import { reviewInventoryPgrImport } from '../service/inventory-pgr-import.service';
import type { ReviewInventoryPgrImportParams } from '../service/inventory-pgr-import.types';

export function useMutReviewInventoryPgrImport() {
  return useMutate({
    mutationFn: (params: ReviewInventoryPgrImportParams) =>
      reviewInventoryPgrImport(params),
    invalidateManyQueryKeys: () => [],
  });
}
