import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { IErrorResp } from '@v2/types/error.type';
import { AxiosError } from 'axios';
import { deleteFormModel } from '../service/delete-form-model.service';

export function useMutateDeleteFormModel() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: deleteFormModel,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_MODEL,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Modelo de formulário excluído com sucesso!'),
    onError: (error) => {
      const axiosError = error as AxiosError;
      const status = axiosError?.response?.status;

      if (status === 409 || status === 422) {
        onErrorMessage(
          'Este modelo possui aplicações vinculadas e não pode ser excluído.',
        );
        return;
      }

      onErrorMessage(axiosError as unknown as IErrorResp);
    },
  });
}
