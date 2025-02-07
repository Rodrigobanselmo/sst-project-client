import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addDocumentControl } from '../service/add-document-control.service';

export const useMutateAddDocumentControl = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addDocumentControl,
    invalidateQueryKey: (_, variables) => [
      QueryKeyDocumentControlEnum.DOCUMENT_CONTROL,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Documento adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
