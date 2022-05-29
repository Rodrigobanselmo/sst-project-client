import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { SignInCredentials, useAuth } from '../../../../contexts/AuthContext';
import { IErrorResp } from '../../../errors/types';

export async function sign(
  data: SignInCredentials,
  signUp: (credentials: SignInCredentials) => Promise<void>,
) {
  await signUp(data);
}

export function useMutationSign() {
  const { signUp } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (data: SignInCredentials) => sign(data, signUp), {
    onSuccess: async (resp) => {
      enqueueSnackbar('Conta criada com sucesso', { variant: 'success' });
      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
