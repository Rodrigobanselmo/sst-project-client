import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import { exportAcgihBeiComparison } from '../service/acgih-bei-comparison-export.service';
import type { IBrowseAcgihBeiComparisonParams } from '../service/acgih-bei-comparison.types';

type ExportFilters = Pick<
  IBrowseAcgihBeiComparisonParams,
  'search' | 'comparisonStatus' | 'suggestedAction' | 'confidence'
>;

export const useExportAcgihBeiComparison = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (filters?: ExportFilters) => exportAcgihBeiComparison(filters),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};
