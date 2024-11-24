import { QueryKeyActionPlanEnum } from '@v2/constants/enums/action-plan-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { exportCharacterization } from '../service/export-characterization.service';

export const useMutateExportCharacterization = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: exportCharacterization,
    invalidateQueryKey: [],
    onSuccess: () => onSuccessMessage('Aquivo exportado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
