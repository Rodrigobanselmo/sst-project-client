import { QueryKeyAuthEnum } from '@v2/constants/enums/auth-query-key.enum';
import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { addUserService } from '../service/add-user.service';
import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';

export const useMutateAddUser = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: addUserService,
    invalidateManyQueryKeys: (_, variables) => [
      [QueryKeyAuthEnum.USERS, variables.companyId],
    ],
    onSuccess: () => {
      queryClient.invalidateQueries([QueryEnum.USERS]); //! old fetch
      queryClient.invalidateQueries([QueryEnum.INVITES_USER]); //! old fetch
      queryClient.invalidateQueries([QueryEnum.INVITES]); //! old fetch
      onSuccessMessage('Usuário adicionado com sucesso');
    },
    onError: onErrorMessage,
  });

  return mutate;
};
