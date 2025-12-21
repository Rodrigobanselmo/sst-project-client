import { QueryKeyHierarchyEnum } from '@v2/constants/enums/hierarchy-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { editHierarchy } from '../service/edit-hierarchy.service';

export const useMutateEditHierarchy = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: editHierarchy,
    invalidateQueryKey: (_, variables) => [
      QueryKeyHierarchyEnum.HIERARCHY,
      variables.companyId,
    ],
    onSuccess: () => onSuccessMessage('Hierarquia editada com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
