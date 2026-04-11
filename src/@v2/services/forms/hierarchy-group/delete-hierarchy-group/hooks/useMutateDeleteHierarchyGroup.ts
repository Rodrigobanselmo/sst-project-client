import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { deleteHierarchyGroup } from '../service/delete-hierarchy-group.service';

export const useMutateDeleteHierarchyGroup = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: deleteHierarchyGroup,
    invalidateManyQueryKeys: (_, variables) => [
      [
        QueryKeyFormEnum.FORM_HIERARCHY_GROUPS,
        variables.companyId,
        variables.applicationId,
      ],
      [QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_RISKS, variables.companyId],
    ],
    onSuccess: () => onSuccessMessage('Agrupamento excluído com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
