import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IAbsenteeism } from 'core/interfaces/api/IAbsenteeism';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteAbsenteeism {
  id?: number;
  companyId?: string;
}

export async function upsertRiskDocs(
  data: IDeleteAbsenteeism,
  companyId?: string,
) {
  if (!companyId) return null;

  const response = await api.delete<IAbsenteeism>(
    ApiRoutesEnum.ABSENTEEISMS.replace(':companyId', companyId) + '/' + data.id,
  );

  return response.data;
}

export function useMutDeleteAbsenteeism() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteAbsenteeism) =>
      upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.ABSENTEEISMS]);

        enqueueSnackbar('Falta deletado com sucesso', {
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
