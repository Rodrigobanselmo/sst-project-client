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

export async function inviteUser(email?: string) {
  if (!email) return null;

  await api.post<void>(ApiRoutesEnum.FORGOT_PASS_EMAIL, {
    email,
  });
}

export function useMutResetEmailPass() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async ({ email }: { email?: string }) => inviteUser(email),
    {
      onSuccess: async (companyResp) => {
        enqueueSnackbar('Email para redefinir senha enviado com sucesso', {
          variant: 'success',
        });
        return companyResp;
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
