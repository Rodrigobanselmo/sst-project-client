import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { assignRisksFormApplication } from '../service/assign-risks-form-application.service';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

export const useMutateAssignRisksFormApplication = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: assignRisksFormApplication,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_APPLICATION_RISK_LOGS,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Risco atribuído com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
