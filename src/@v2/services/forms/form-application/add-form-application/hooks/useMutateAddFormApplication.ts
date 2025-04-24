import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addFormApplication } from '../service/add-form-application.service';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

export const useMutateAddFormApplication = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addFormApplication,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_APPLICATION,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Fomulário adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
