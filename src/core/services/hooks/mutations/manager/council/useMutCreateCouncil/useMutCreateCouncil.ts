import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';
import { StatusEnum } from 'project/enum/status.enum';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessionalCouncil } from 'core/interfaces/api/IProfessional';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface ICreateCouncil {
  councilType: string;
  councilUF?: string;
  councilId: string;
  companyId: string;
  professionalId: number;
}

export async function createCouncil(data: ICreateCouncil, companyId?: string) {
  if (!companyId) return null;

  const response = await api.post<IProfessionalCouncil>(
    ApiRoutesEnum.COUNCIL.replace(':companyId', companyId),
    {
      ...data,
      companyId,
    },
  );

  return response.data;
}

export function useMutCreateCouncil() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: ICreateCouncil) => createCouncil(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        queryClient.invalidateQueries([QueryEnum.PROFESSIONALS]);

        enqueueSnackbar('Item criado com sucesso', {
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
