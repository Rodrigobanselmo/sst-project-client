import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { api } from 'core/services/apiClient';

import { IErrorResp } from '../../../../errors/types';

export interface IAdminResetPasswordApi {
  companyId: string;
  id: number;
  password: string;
}

export async function adminResetPassword({
  companyId,
  id,
  password,
}: IAdminResetPasswordApi) {
  const response = await api.post(
    ApiRoutesEnum.USERS_ADMIN_RESET_PASS.replace(
      ':companyId',
      companyId,
    ).replace(':id', String(id)),
    { password },
  );
  return response.data;
}

export function useMutAdminResetPassword() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IAdminResetPasswordApi) => adminResetPassword(data),
    {
      onSuccess: () => {
        enqueueSnackbar(
          'Senha redefinida. O usuário deverá alterá-la no próximo login.',
          { variant: 'success' },
        );
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(
          error.response?.data?.message || 'Não foi possível redefinir a senha',
          { variant: 'error' },
        );
      },
    },
  );
}
