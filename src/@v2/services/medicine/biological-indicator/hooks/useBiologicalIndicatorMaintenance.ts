import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  downloadBiologicalIndicatorTemplate,
  exportBiologicalIndicators,
  importBiologicalIndicatorPreview,
} from '../service/biological-indicator-maintenance.service';

export const useExportBiologicalIndicators = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => exportBiologicalIndicators(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useDownloadBiologicalIndicatorTemplate = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => downloadBiologicalIndicatorTemplate(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useImportBiologicalIndicatorPreview = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => importBiologicalIndicatorPreview(file),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};
