import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { SignInCredentials, useAuth } from '../../../../contexts/AuthContext';
import { IErrorResp } from '../../../errors/types';

export async function login(
  data: SignInCredentials,
  signIn: (credentials: SignInCredentials) => Promise<void>,
) {
  await signIn(data);
}

export function useMutationLogin() {
  const { signIn } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (data: SignInCredentials) => login(data, signIn), {
    onSuccess: async (resp) => {
      enqueueSnackbar('Login realizado com sucesso', { variant: 'success' });
      return resp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
