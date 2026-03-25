import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { softDeleteFormApplication } from '../service/soft-delete-form-application.service';

export const useMutateSoftDeleteFormApplication = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: softDeleteFormApplication,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_APPLICATION,
      variables.companyId,
    ],
    onSuccess: () =>
      onSuccessMessage('Formulário excluído com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
