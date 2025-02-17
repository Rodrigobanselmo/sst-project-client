import { QueryKeyDocumentControlEnum } from '@v2/constants/enums/document-control-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editDocumentControlFile } from '../service/edit-document-control-file.service';

export const useMutateEditDocumentControlFile = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editDocumentControlFile,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyDocumentControlEnum.DOCUMENT_CONTROL, variables.companyId],
      [QueryKeyDocumentControlEnum.DOCUMENT_CONTROL_FILE, variables.companyId],
    ],
    onSuccess: () => onSuccessMessage('Documento editado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
