import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAbsenteeism } from 'core/interfaces/api/IAbsenteeism';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';
import { ICreateAbsenteeism } from '../useMutCreateAbsenteeism/useMutCreateAbsenteeism';

export interface IUpdateAbsenteeism extends Partial<ICreateAbsenteeism> {
  id?: number;
}

export async function upsertRiskDocs(
  data: IUpdateAbsenteeism,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.patch<IAbsenteeism>(
    ApiRoutesEnum.ABSENTEEISMS.replace(':companyId', companyId) + '/' + data.id,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateAbsenteeism() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateAbsenteeism) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.ABSENTEEISMS]);

        enqueueSnackbar('Falta editado com sucesso', {
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
