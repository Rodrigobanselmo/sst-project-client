import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editFormModel } from '../service/edit-form-model.service';

export function useMutateEditFormModel() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editFormModel,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_MODEL,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Formulário editado com sucesso!'),
    onError: onErrorMessage,
  });

  return mutate;
}
