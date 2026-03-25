import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { IErrorResp } from '@v2/types/error.type';
import { AxiosError } from 'axios';
import { duplicateFormModel } from '../service/duplicate-form-model.service';

export function useDuplicateFormModel() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: duplicateFormModel,
    invalidateQueryKey: (_, variables) => [
      QueryKeyFormEnum.FORM_MODEL,
      variables.companyId,
    ],
    onSuccess: () =>
      onSuccessMessage('Modelo duplicado. Você pode ajustar o novo formulário.'),
    onError: (error) => {
      const status = (error as AxiosError)?.response?.status;
      if (status === 404) {
        onErrorMessage(
          'Serviço de duplicação não encontrado ou modelo indisponível. Confirme se a API está atualizada e tente de novo.',
        );
        return;
      }
      onErrorMessage(error as IErrorResp);
    },
  });
}
