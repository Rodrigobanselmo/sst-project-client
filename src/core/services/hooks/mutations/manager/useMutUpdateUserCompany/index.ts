import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { PermissionEnum } from 'project/enum/permission.enum';
import { RoleEnum } from 'project/enum/roles.enums';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IUser } from 'core/interfaces/api/IUser';
import { IMutationOptions } from 'core/interfaces/IMutationOptions';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../errors/types';

export interface IUpdateUser {
  readonly id: string;
  readonly companyId?: string;
  readonly permissions?: PermissionEnum[];
  readonly roles?: RoleEnum[];
  readonly status?: StatusEnum;
}

export async function updateUserCompany(data: IUpdateUser) {
  const response = await api.patch<IUser>(ApiRoutesEnum.USERS + '/company', {
    ...data,
  });
  return response.data;
}

export function useMutUpdateUserCompany({
  successMessage = 'Usuário editado com sucesso',
}: IMutationOptions = {}) {
  const { enqueueSnackbar } = useSnackbar();
  const { companyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpdateUser) => updateUserCompany({ companyId, ...data }),
    {
      onSuccess: async (user) => {
        if (user) {
          queryClient.setQueryData(
            [QueryEnum.USERS, companyId],
            (oldData: IUser[] | undefined) =>
              oldData
                ? oldData.map((data) =>
                    user.id === data.id ? { ...data, ...user } : data,
                  )
                : [user],
          );

          queryClient.setQueryData(
            [QueryEnum.USERS, companyId, user.id],
            () => user,
          );
        }
        enqueueSnackbar(successMessage, {
          variant: 'success',
        });
      },
      onError: (error: IErrorResp) => {
        enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
