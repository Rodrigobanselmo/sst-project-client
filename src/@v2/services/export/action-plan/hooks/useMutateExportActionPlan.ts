import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { exportActionPlan } from '../service/export-action-plan.service';

export const useMutateExportActionPlan = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: exportActionPlan,
    invalidateQueryKey: [],
    onSuccess: () => onSuccessMessage('Arquivo exportado com sucesso'),
    onError: onErrorMessage,
  });
};
