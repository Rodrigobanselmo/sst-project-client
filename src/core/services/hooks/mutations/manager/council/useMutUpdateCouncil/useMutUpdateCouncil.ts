import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IUpdateCouncil {
  id: number;
  councilType: string;
  councilUF?: string;
  councilId: string;
  professionalId: number;
}

export async function upsertRiskDocs(data: IUpdateCouncil, companyId?: string) {
  if (!companyId) return null;

  const response = await api.patch(
    ApiRoutesEnum.COUNCIL.replace(':companyId', companyId) + '/' + data.id,
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutUpdateCouncil() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IUpdateCouncil) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.PROFESSIONALS]);

        enqueueSnackbar('Contato editado com sucesso', {
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
