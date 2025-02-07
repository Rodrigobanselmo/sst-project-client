import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { deleteDocumentControl } from '../service/delete-document-control.service';

export const useMutateDeleteDocumentControl = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteDocumentControl,
    invalidateQueryKey: (_, variables) => [
      QueryKeyDocumentControlEnum.DOCUMENT_CONTROL,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Documento deletado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
