import { useMutate } from '@v2/hooks/api/useMutate';

import { previewInventoryPgrImport } from '../service/inventory-pgr-import.service';
import type { PreviewInventoryPgrImportParams } from '../service/inventory-pgr-import.types';

export function useMutPreviewInventoryPgrImport() {
  return useMutate({
    mutationFn: (params: PreviewInventoryPgrImportParams) =>
      previewInventoryPgrImport(params),
    invalidateManyQueryKeys: () => [],
  });
}
