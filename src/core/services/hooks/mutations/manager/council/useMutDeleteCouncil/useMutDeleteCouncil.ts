import { useMutation } from 'react-query';

import { useSnackbar } from 'notistack';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IProfessionalCouncil } from 'core/interfaces/api/IProfessional';
import { api } from 'core/services/apiClient';
import { queryClient } from 'core/services/queryClient';

import { IErrorResp } from '../../../../../errors/types';

export interface IDeleteCouncil {
  id?: number;
  professionalId: number;
  companyId?: string;
}

export async function upsertRiskDocs(data: IDeleteCouncil, companyId?: string) {
  if (!companyId) return null;

  const response = await api.delete<IProfessionalCouncil>(
    `${ApiRoutesEnum.COUNCIL.replace(':companyId', companyId)}/${
      data.professionalId
    }/${data.id}`,
  );

  return response.data;
}

export function useMutDeleteCouncil() {
  const { getCompanyId } = useGetCompanyId();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation(
    async (data: IDeleteCouncil) => upsertRiskDocs(data, getCompanyId(data)),
    {
      onSuccess: async (resp) => {
        if (resp) queryClient.invalidateQueries([QueryEnum.PROFESSIONALS]);

        enqueueSnackbar('Council deletado com sucesso', {
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
