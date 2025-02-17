import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addDocumentControlFile } from '../service/add-document-control-file.service';

export const useMutateAddDocumentControlFile = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addDocumentControlFile,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyDocumentControlEnum.DOCUMENT_CONTROL_FILE, variables.companyId],
      [QueryKeyDocumentControlEnum.DOCUMENT_CONTROL, variables.companyId],
    ],
    onSuccess: () => onSuccessMessage('Documento adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
