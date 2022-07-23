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

interface IInviteUser {
  readonly companyId?: string;
  readonly email: string;
  readonly permissions?: string[];
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
      if (companyResp) {
        const actualData = queryClient.getQueryData(
          // eslint-disable-next-line prettier/prettier
          [QueryEnum.INVITES, companyId],
        );
        if (actualData)
          queryClient.setQueryData(
            [QueryEnum.INVITES, companyId],
            (oldData: IInvites[] | undefined) =>
              oldData
                ? removeDuplicate([companyResp, ...oldData], {
                    removeById: 'email',
                  })
                : [companyResp],
          );
      }

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
