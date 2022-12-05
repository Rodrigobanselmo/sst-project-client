import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { ICat } from 'core/interfaces/api/ICat';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { ICreateCat } from '../useMutCreateCat/useMutCreateCat';

export interface IUpdateCat extends Partial<ICreateCat> {
  id?: number;
}

export async function upsertRiskDocs(data: IUpdateCat, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch<ICat>(
    ApiRoutesEnum.CATS.replace(':companyId', companyId) + '/' + data.id,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateCat() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateCat) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.CATS]);

        enqueueSnackbar('CAT editado com sucesso', {
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
