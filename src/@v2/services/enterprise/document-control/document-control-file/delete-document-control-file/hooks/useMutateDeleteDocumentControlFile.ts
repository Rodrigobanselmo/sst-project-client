import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { deleteDocumentControlFile } from '../service/delete-document-control-file.service';

export const useMutateDeleteDocumentControlFile = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteDocumentControlFile,
    invalidateQueryKey: (_, variables) => [
      QueryKeyDocumentControlEnum.DOCUMENT_CONTROL_FILE,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Documento deletado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
