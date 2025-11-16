import { useApiResponseHandler } from '@v2/hooks/api/useApiResponseHandler';
import { useMutate } from '@v2/hooks/api/useMutate';
import { publicFormApplicationLogin } from '../service/public-form-application-login.service';

export const useMutatePublicFormApplicationLogin = () => {
  const { onErrorMessage, onSuccessMessage } = useApiResponseHandler();

  const mutate = useMutate({
    mutationFn: publicFormApplicationLogin,
    invalidateQueryKey: false,
    onSuccess: () => {
      onSuccessMessage('Login efetuado com sucesso');
    },
    onError: onErrorMessage,
  });

  return mutate;
};
