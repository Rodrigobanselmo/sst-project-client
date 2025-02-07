import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addDocumentControlSystemFile } from '../service/add-document-control-system-file.service';

export const useMutateaddDocumentControlSystemFile = () => {
  const { onErrorMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addDocumentControlSystemFile,
    invalidateQueryKey: false,
    onError: onErrorMessage,
  });

  return mutate;
};
