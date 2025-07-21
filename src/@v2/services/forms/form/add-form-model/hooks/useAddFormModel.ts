import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addFormModel } from '../service/add-form-model.service';

export function useAddFormModel() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addFormModel,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_MODEL,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Formulário criado com sucesso!'),
    onError: onErrorMessage,
  });

  return mutate;
}
