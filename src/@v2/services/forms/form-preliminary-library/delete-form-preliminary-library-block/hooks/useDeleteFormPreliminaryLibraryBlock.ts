import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import {
  deleteFormPreliminaryLibraryBlock,
  DeleteFormPreliminaryLibraryBlockParams,
} from '../service/delete-form-preliminary-library-block.service';

export function useDeleteFormPreliminaryLibraryBlock() {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  return useMutate({
    mutationFn: (params: DeleteFormPreliminaryLibraryBlockParams) =>
      deleteFormPreliminaryLibraryBlock(params),
    invalidateQueryKey: [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_BLOCKS],
    onSuccess: () => onSuccessMessage('Bloco da biblioteca excluído com sucesso.'),
    onError: onErrorMessage,
  });
}
