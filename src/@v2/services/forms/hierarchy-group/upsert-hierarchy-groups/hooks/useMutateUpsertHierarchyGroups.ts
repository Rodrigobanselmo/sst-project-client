import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { upsertHierarchyGroups } from '../service/upsert-hierarchy-groups.service';
import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';

export const useMutateUpsertHierarchyGroups = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: upsertHierarchyGroups,
    invalidateManyQueryKeys: (_, variables) => [
      [
        QueryKeyFormEnum.FORM_HIERARCHY_GROUPS,
        variables.companyId,
        variables.applicationId,
      ],
      [
        QueryKeyFormEnum.FORM_QUESTIONS_ANSWERS_RISKS,
        variables.companyId,
      ],
    ],
    onSuccess: () =>
      onSuccessMessage('Agrupamentos de setores atualizados com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
