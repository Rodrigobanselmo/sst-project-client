import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addStatus } from '../service/add-status.service';
import { QueryKeyEnum } from '@v2/constants/enums/query-key.enum';
import { queryClient } from 'layouts/default/providers';
import { StatusBrowseModel } from '@v2/models/security/models/status/status-browse.model';
import { getKeyBrowseStatus } from '../../browse/hooks/useFetchBrowseStatus';
import { StatusBrowseResultModel } from '@v2/models/security/models/status/status-browse-result.model';

export const useMutateAddStatus = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addStatus,
    invalidateQueryKey: (_, variables) => [
      QueryKeyEnum.STATUS,
      variables.companyId,
    ],
    onMutate: async (newStatus) => {
      const queryKey = getKeyBrowseStatus(newStatus);

      await queryClient.cancelQueries({ queryKey });
      const previousTodos = queryClient.getQueryData(queryKey);
      queryClient.setQueryData(queryKey, (old: StatusBrowseModel) => {
        const newStatusModel = new StatusBrowseResultModel({
          name: newStatus.name,
          id: Math.random(),
          color: newStatus.color,
        });

        old.results.push(newStatusModel);

        return old;
      });

      return { previousTodos };
    },
    onSuccess: () => onSuccessMessage('Status adicionado com sucesso'),
    onError: onErrorMessage,
  });

  return mutate;
};
