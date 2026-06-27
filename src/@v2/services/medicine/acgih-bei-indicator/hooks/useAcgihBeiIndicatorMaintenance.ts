import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  applyAcgihBeiIndicatorImport,
  downloadAcgihBeiIndicatorTemplate,
  exportAcgihBeiIndicators,
  importAcgihBeiIndicatorPreview,
} from '../service/acgih-bei-indicator-maintenance.service';
import { acgihBeiIndicatorQueryKeys } from './acgih-bei-indicator.query-keys';

export const useExportAcgihBeiIndicators = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => exportAcgihBeiIndicators(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useDownloadAcgihBeiIndicatorTemplate = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => downloadAcgihBeiIndicatorTemplate(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useImportAcgihBeiIndicatorPreview = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => importAcgihBeiIndicatorPreview(file),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useApplyAcgihBeiIndicatorImport = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => applyAcgihBeiIndicatorImport(file),
    invalidateManyQueryKeys: () => [acgihBeiIndicatorQueryKeys.all()],
    onSuccess: () => onSuccessMessage('Curadoria ACGIH/BEI aplicada'),
    onError: onErrorMessage,
  });
};
