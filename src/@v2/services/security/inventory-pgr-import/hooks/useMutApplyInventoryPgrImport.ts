import { useMutate } from '@v2/hooks/api/useMutate';

import { applyInventoryPgrImport } from '../service/inventory-pgr-import.service';
import type { ApplyInventoryPgrImportParams } from '../service/inventory-pgr-import.types';

export function useMutApplyInventoryPgrImport() {
  return useMutate({
    mutationFn: (params: ApplyInventoryPgrImportParams) =>
      applyInventoryPgrImport(params),
    invalidateManyQueryKeys: () => [],
  });
}
