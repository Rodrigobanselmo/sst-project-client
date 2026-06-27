import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';

import {
  applyEsocialProcedureImport,
  downloadEsocialProcedureTemplate,
  exportEsocialProcedures,
  importEsocialProcedurePreview,
} from '../service/esocial-procedure-maintenance.service';
import { esocialProcedureQueryKeys } from './esocial-procedure.query-keys';

export const useExportEsocialProcedures = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => exportEsocialProcedures(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useDownloadEsocialProcedureTemplate = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: () => downloadEsocialProcedureTemplate(),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useImportEsocialProcedurePreview = () => {
  const { onErrorMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => importEsocialProcedurePreview(file),
    invalidateManyQueryKeys: () => [],
    onError: onErrorMessage,
  });
};

export const useApplyEsocialProcedureImport = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();
  return useMutate({
    mutationFn: (file: File) => applyEsocialProcedureImport(file),
    invalidateManyQueryKeys: () => [esocialProcedureQueryKeys.all()],
    onSuccess: () => onSuccessMessage('Curadoria da Tabela 27 aplicada'),
    onError: onErrorMessage,
  });
};
