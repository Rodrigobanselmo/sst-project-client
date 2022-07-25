import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { queryClient } from 'core/services/queryClient';

import { ICompanyGroup } from '../../../../../interfaces/api/ICompanyGroup';

export interface IUpsertCompanyGroup {
  id?: number;
  name?: string;
  description?: string;
  companiesIds?: string[];
  companyId?: string;
}

export async function upsertCompanyGroup(
  data: IUpsertCompanyGroup,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.post<ICompanyGroup>(
    `${ApiRoutesEnum.COMPANY_GROUP}`.replace(':companyId', companyId),
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertCompanyGroup() {
  const { user } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpsertCompanyGroup) =>
      upsertCompanyGroup({ ...data }, user?.companyId),
    {
      onSuccess: async (resp) => {
        if (resp) {
          queryClient.invalidateQueries([
            QueryEnum.COMPANIES,
            user?.companyId,
            1,
            { groupId: resp.id },
          ]);

          queryClient.invalidateQueries([
            QueryEnum.COMPANY_GROUP,
            user?.companyId,
          ]);
        }

        enqueueSnackbar('Grupos empresariais atualizados com sucesso', {
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
