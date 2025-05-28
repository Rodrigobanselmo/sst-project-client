import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editFormApplication } from '../service/edit-form-application.service';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

export const useMutateEditFormApplication = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editFormApplication,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_APPLICATION,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Fomulário editado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
