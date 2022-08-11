import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { queryClient } from 'core/services/queryClient';

import { IAccessGroup } from './../../../../../interfaces/api/IAccessGroup';

export interface IUpsertAccessGroup {
  id?: number;
  name?: string;
  description?: string;
  companyId?: string;
  roles?: string[];
  permissions?: string[];
}

export async function upsertAccessGroup(
  data: IUpsertAccessGroup,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<IAccessGroup>(
    `${ApiRoutesEnum.AUTH_GROUP}`.replace(':companyId', companyId),
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertAccessGroup() {
  const { user } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertAccessGroup) =>
      upsertAccessGroup({ ...data }, data?.companyId || user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp)
          queryClient.invalidateQueries([
            QueryEnum.AUTH_GROUP,
            user?.companyId,
          ]);

        enqueueSnackbar('Grupo de permissões criado', {
          variant: 'success',
        });
        return resp;
      },
      onError: (error: IErrorResp) => {
        if (error.response?.data)
          enqueueSnackbar(error.response.data.message, { variant: 'error' });
      },
    },
  );
}
