import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IInvites } from 'core/interfaces/api/IInvites';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { useAuth } from '../../../../../contexts/AuthContext';
import { IErrorResp } from '../../../../errors/types';

interface IInviteUser {
  readonly companyId?: string;
  readonly email: string;
  readonly permissions?: PermissionEnum[];
  readonly roles?: RoleEnum[];
}

export async function inviteUser(data: IInviteUser, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IInvites>(ApiRoutesEnum.INVITES, {
    companyId,
    ...data,
  });
  return response.data;
}

export function useMutInviteUser() {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(async (data: IInviteUser) => inviteUser(data, companyId), {
    onSuccess: async (companyResp) => {
      if (companyResp)
        queryClient.setQueryData(
          [QueryEnum.INVITES, companyId],
          (oldData: IInvites[] | undefined) =>
            oldData ? [companyResp, ...oldData] : [companyResp],
        );

      enqueueSnackbar('Convite enviado com sucesso', {
        variant: 'success',
      });
      return companyResp;
    },
    onError: (error: IErrorResp) => {
      enqueueSnackbar(error.response.data.message, { variant: 'error' });
    },
  });
}
