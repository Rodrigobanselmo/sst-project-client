import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IInvites } from 'core/interfaces/api/IInvites';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';
import { removeDuplicate } from 'core/utils/helpers/removeDuplicate';

import { IErrorResp } from '../../../../errors/types';

export interface IResetPassApi {
  password: string;
  tokenId: string;
}

export async function resetPass({ password, tokenId }: IResetPassApi) {
  if (!password || !tokenId) return null;

  await api.patch<void>(ApiRoutesEnum.USERS_RESET_PASS, {
    tokenId,
    password,
  });

  return password;
}

export function useMutResetPass() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(async (data: IResetPassApi) => resetPass(data), {
    onSuccess: async (password) => {
      enqueueSnackbar('Senha refinida com sucesso', {
        variant: 'success',
      });

      // return to login page
      window.location.href = '/login';
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
