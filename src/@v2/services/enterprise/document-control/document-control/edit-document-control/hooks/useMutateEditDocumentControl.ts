import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editDocumentControl } from '../service/edit-document-control.service';

export const useMutateEditDocumentControl = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editDocumentControl,
    invalidateQueryKey: (_, variables) => [
      QueryKeyDocumentControlEnum.DOCUMENT_CONTROL,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Documento editado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
