import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';
import { updateUser } from 'store/reducers/user/userSlice';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { useAppDispatch } from 'core/hooks/useAppDispatch';
import { IUser } from 'core/interfaces/api/IUser';
import { IMutationOptions } from 'core/interfaces/IMutationOptions';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpdateUser {
  name?: string;
  cpf?: string;
  type?: ProfessionalTypeEnum;
  crea?: string;
  crm?: string;
  googleExternalId?: string;
  formation?: string[];
  certifications?: string[];
  councils?: {
    councilType?: string;
    councilUF?: string;
    councilId?: string;
  }[];
  token?: string;
  oldPassword?: string;
  password?: string;
}

export async function updateUserApi(data: IUpdateUser) {
  const response = await api.patch<IUser>(ApiRoutesEnum.USERS, {
    ...data,
  });
  return response.data;
}

export function useMutUpdateUser({
  successMessage = 'Usuário editado com sucesso',
}: IMutationOptions = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const dispatch = useAppDispatch();

  return useMutation(async (data: IUpdateUser) => updateUserApi(data), {
    onSuccess: async (user) => {
      dispatch(updateUser(user));
      enqueueSnackbar(successMessage, {
        variant: 'success',
      });
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
