import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { updateUser } from 'store/reducers/user/userSlice';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IUser } from 'core/interfaces/api/IUser';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpdateUser {
  name?: string;
  oldPassword?: string;
  password?: string;
}

export async function updateUserApi(data: IUpdateUser) {
  const response = await api.patch<IUser>(ApiRoutesEnum.USERS, {
    ...data,
  });
  return response.data;
}

export function useMutUpdateUser() {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  return useMutation(async (data: IUpdateUser) => updateUserApi(data), {
    onSuccess: async (user) => {
      dispatch(updateUser(user));
      enqueueSnackbar('Usuário editado com sucesso', {
        variant: 'success',
      });
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
