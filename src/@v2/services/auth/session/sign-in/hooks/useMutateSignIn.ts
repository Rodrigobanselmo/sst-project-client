import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { signInService } from '../service/sign-in.service';

export const useMutateSignIn = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: signInService,
    invalidateQueryKey: false,
    onSuccess: () => {
      onSuccessMessage('Login efetuado com sucesso');
    },
    onError: onErrorMessage,
  });

  return mutate;
};
