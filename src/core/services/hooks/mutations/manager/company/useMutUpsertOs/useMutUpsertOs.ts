import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IOs } from 'core/interfaces/api/IOs';
import { IDraftTypes } from 'core/interfaces/IDraftBlocks';
import { api } from 'core/services/apiClient';
import { IErrorResp } from 'core/services/errors/types';
import { queryClient } from 'core/services/queryClient';

export interface IUpsertOs {
  companyId?: string;
  socialName: IDraftTypes.RootObject;
  med: IDraftTypes.RootObject;
  rec: IDraftTypes.RootObject;
  obligations: IDraftTypes.RootObject;
  prohibitions: IDraftTypes.RootObject;
  procedures: IDraftTypes.RootObject;
  cipa: IDraftTypes.RootObject;
  declaration: IDraftTypes.RootObject;
}

export async function upsertOs(data: IUpsertOs, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IOs>(
    `${ApiRoutesEnum.OS}`.replace(':companyId', companyId),
    {
      companyId,
      ...data,
    },
  );

  return response.data;
}

export function useMutUpsertOs() {
  const { enqueueSnackbar } = useSnackbar();
  const { getCompanyId } = useGetCompanyId();

  return useMutation(
    async (data: IUpsertOs) => upsertOs({ ...data }, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.OS]);

        enqueueSnackbar('OS editado com sucesso', {
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
