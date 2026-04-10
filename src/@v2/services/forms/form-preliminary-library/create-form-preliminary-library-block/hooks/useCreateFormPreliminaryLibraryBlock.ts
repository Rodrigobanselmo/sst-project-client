import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  createFormPreliminaryLibraryBlock,
  CreateFormPreliminaryLibraryBlockParams,
} from '../service/create-form-preliminary-library-block.service';

export function useCreateFormPreliminaryLibraryBlock() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: (params: CreateFormPreliminaryLibraryBlockParams) =>
      createFormPreliminaryLibraryBlock(params),
    invalidateQueryKey: [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_BLOCKS],
    onSuccess: () => onSuccessMessage('Bloco da biblioteca criado com sucesso!'),
    onError: onErrorMessage,
  });
}
